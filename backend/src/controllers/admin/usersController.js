const { User, Order, Product, TokenUsage } = require('../../models');
const { Op } = require('sequelize');

// 회원 목록 조회 (페이징, 검색, 필터)
exports.getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        // 검색 및 필터 조건
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        // 전체 개수 및 회원 목록 조회
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'email', 'name', 'phone', 'birth_date', 'gender', 'status', 'created_at', 'updated_at'],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
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

        // 회원 정보 조회
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }

        // 주문 내역 조회 (Product와 조인)
        const orders = await Order.findAll({
            where: { user_id: id },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['name']
            }],
            order: [['created_at', 'DESC']]
        });

        // 토큰 사용 내역 조회
        const tokens = await TokenUsage.findAll({
            where: { user_id: id },
            order: [['created_at', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                user,
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

        const [affectedRows] = await User.update(
            { status },
            { where: { id } }
        );

        if (affectedRows === 0) {
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

        const affectedRows = await User.destroy({
            where: { id }
        });

        if (affectedRows === 0) {
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
