const { pool } = require('../../config/database');

// 대시보드 통계 조회
exports.getDashboardStats = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        // 1. 일별 가입자 수 (최근 7일)
        const [dailyUsers] = await connection.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

        // 2. 일별 매출액 (최근 7일)
        const [dailyRevenue] = await connection.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(amount) as total
      FROM orders
      WHERE status = 'completed'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

        // 3. AI 토큰 사용량 (최근 7일)
        const [dailyTokens] = await connection.query(`
      SELECT 
        DATE(created_at) as date,
        SUM(tokens_used) as total
      FROM token_usage
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

        // 4. 전체 통계
        const [totalStats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE status = 'active') as active_users,
        (SELECT SUM(amount) FROM orders WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'completed') as total_orders
    `);

        connection.release();

        res.json({
            success: true,
            data: {
                dailyUsers,
                dailyRevenue,
                dailyTokens,
                totalStats: totalStats[0]
            }
        });

    } catch (error) {
        console.error('대시보드 통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 조회에 실패했습니다.'
        });
    }
};