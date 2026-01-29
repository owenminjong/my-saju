const { User, Order, TokenUsage, sequelize } = require('../../models');
const { Op } = require('sequelize');

// 대시보드 통계 조회
exports.getDashboardStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // 1. 일별 가입자 수 (최근 7일)
        const dailyUsers = await User.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', '*'), 'count']
            ],
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
            raw: true
        });

        // 2. 일별 매출액 (최근 7일)
        const dailyRevenue = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'total']
            ],
            where: {
                status: 'completed',
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
            raw: true
        });

        // 3. AI 토큰 사용량 (최근 7일)
        const dailyTokens = await TokenUsage.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('SUM', sequelize.col('tokens_used')), 'total']
            ],
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']],
            raw: true
        });

        // 4. 전체 통계
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'active' } });
        const totalRevenueResult = await Order.sum('amount', { where: { status: 'completed' } });
        const totalOrders = await Order.count({ where: { status: 'completed' } });

        const totalStats = {
            total_users: totalUsers,
            active_users: activeUsers,
            total_revenue: totalRevenueResult || 0,
            total_orders: totalOrders
        };

        res.json({
            success: true,
            data: {
                dailyUsers,
                dailyRevenue,
                dailyTokens,
                totalStats
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
