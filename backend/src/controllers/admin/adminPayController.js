const { Order, User, Product } = require('../../../models');
const { Op } = require('sequelize');

// 주문 목록 조회
exports.getOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            status = '',
            startDate = '',
            endDate = ''
        } = req.query;

        console.log('📋 주문 조회 요청:', { page, limit, search, status, startDate, endDate });

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [
                    new Date(startDate + ' 00:00:00'),
                    new Date(endDate + ' 23:59:59')
                ]
            };
        }

        if (search) {
            whereClause[Op.or] = [
                { order_id: { [Op.like]: `%${search}%` } },
                { imp_uid: { [Op.like]: `%${search}%` } },
                { payment_key: { [Op.like]: `%${search}%` } }
            ];
        }

        const userWhere = {};
        if (search) {
            userWhere[Op.or] = [
                { email: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } }
            ];
        }

        const result = await Order.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'name'], // ✅ phone 제거
                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
                    required: false
                },
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'price', 'type']
                }
            ],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [['created_at', 'DESC']],
            distinct: true,
            subQuery: false
        });

        console.log('✅ 주문 조회 성공:', result.count, '건');

        res.json({
            success: true,
            orders: result.rows,
            totalPages: Math.ceil(result.count / limit),
            currentPage: parseInt(page),
            total: result.count,
            limit: parseInt(limit)
        });

    } catch (error) {
        console.error('❌ 주문 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '주문 조회 실패',
            error: error.message
        });
    }
};

// 주문 상세 조회
exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'name', 'created_at'] // ✅ phone 제거
                },
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'price', 'type', 'description']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('❌ 주문 상세 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '주문 상세 조회 실패',
            error: error.message
        });
    }
};

// 주문 취소
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: '이미 취소된 주문입니다.'
            });
        }

        if (order.status === 'refunded') {
            return res.status(400).json({
                success: false,
                message: '환불된 주문은 취소할 수 없습니다.'
            });
        }

        await order.update({
            status: 'cancelled',
            cancelled_at: new Date()
        });

        console.log('✅ 주문 취소 완료:', order.order_id);

        res.json({
            success: true,
            message: '주문이 취소되었습니다.',
            order
        });

    } catch (error) {
        console.error('❌ 주문 취소 에러:', error);
        res.status(500).json({
            success: false,
            message: '주문 취소 실패',
            error: error.message
        });
    }
};

// 환불 처리
exports.refundOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.'
            });
        }

        if (order.status === 'refunded') {
            return res.status(400).json({
                success: false,
                message: '이미 전액 환불된 주문입니다.'
            });
        }

        if (order.status !== 'completed' && order.status !== 'partial_refunded') {
            return res.status(400).json({
                success: false,
                message: '완료된 주문만 환불할 수 있습니다.'
            });
        }

        const refundAmount = parseInt(amount) || order.amount;
        const totalRefunded = order.refunded_amount + refundAmount;

        if (totalRefunded > order.amount) {
            return res.status(400).json({
                success: false,
                message: `환불 금액이 주문 금액을 초과합니다. (최대: ${order.amount - order.refunded_amount}원)`
            });
        }

        let newStatus = 'partial_refunded';
        if (totalRefunded === order.amount) {
            newStatus = 'refunded';
        }

        await order.update({
            status: newStatus,
            refunded_amount: totalRefunded
        });

        console.log('✅ 환불 처리 완료:', order.order_id, `(${refundAmount}원)`);

        res.json({
            success: true,
            message: `환불이 완료되었습니다. (${refundAmount}원)`,
            order
        });

    } catch (error) {
        console.error('❌ 환불 처리 에러:', error);
        res.status(500).json({
            success: false,
            message: '환불 처리 실패',
            error: error.message
        });
    }
};
