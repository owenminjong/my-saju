const { pool } = require('../../config/database');

// 회원 목록 조회 (페이징, 검색, 필터)
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        const connection = await pool.getConnection();

        // 검색 및 필터 조건
        let whereClause = 'WHERE 1=1';
        const params = [];

        if (search) {
            whereClause += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            whereClause += ' AND status = ?';
            params.push(status);
        }

        // 전체 개수
        const [countResult] = await connection.query(
            `SELECT COUNT(*) as total FROM users ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 회원 목록
        const [users] = await connection.query(
            `SELECT 
        id, email, name, phone, birth_date, gender, 
        status, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), parseInt(offset)]
        );

        connection.release();

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('회원 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원 목록 조회에 실패했습니다.'
        });
    }
};

// 회원 상세 조회
exports.getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        // 회원 정보
        const [users] = await connection.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }

        // 주문 내역
        const [orders] = await connection.query(
            `SELECT o.*, p.name as product_name
       FROM orders o
       JOIN products p ON o.product_id = p.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
            [id]
        );

        // 토큰 사용 내역
        const [tokens] = await connection.query(
            `SELECT * FROM token_usage 
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
            [id]
        );

        connection.release();

        res.json({
            success: true,
            data: {
                user: users[0],
                orders,
                tokens
            }
        });

    } catch (error) {
        console.error('회원 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원 상세 조회에 실패했습니다.'
        });
    }
};

// 회원 상태 변경 (활성화/비활성화/강제탈퇴)
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'banned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 상태값입니다.'
            });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '회원 상태가 변경되었습니다.'
        });

    } catch (error) {
        console.error('회원 상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원 상태 변경에 실패했습니다.'
        });
    }
};

// 회원 강제 탈퇴
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '회원이 삭제되었습니다.'
        });

    } catch (error) {
        console.error('회원 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '회원 삭제에 실패했습니다.'
        });
    }
};