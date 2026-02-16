// backend/src/controllers/admin/adminPayController.js

const { Order, User, Product, DiagnosisResult } = require('../../../models');
const { Op } = require('sequelize');
const PaymentService = require('../../services/paymentService');

/**
 * 📋 주문 목록 조회 (관리자용)
 * GET /api/admin/orders?page=1&limit=20&search=&status=&startDate=&endDate=
 */
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

        // 상태 필터
        if (status) {
            whereClause.status = status;
        }

        // 날짜 필터
        if (startDate && endDate) {
            whereClause.created_at = {
                [Op.between]: [
                    new Date(startDate + ' 00:00:00'),
                    new Date(endDate + ' 23:59:59')
                ]
            };
        }

        // 검색 (주문번호, payment_key)
        if (search) {
            whereClause[Op.or] = [
                { order_id: { [Op.like]: `%${search}%` } },
                { payment_key: { [Op.like]: `%${search}%` } }
            ];
        }

        // 사용자 검색
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
                    attributes: ['id', 'email', 'name'],
                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
                    required: false
                },
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'price']  // ✅ type 제거
                },
                {
                    model: DiagnosisResult,
                    as: 'diagnosisResult',
                    attributes: ['id', 'name', 'created_at']
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
            pagination: {
                total: result.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(result.count / limit)
            }
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

/**
 * 📄 주문 상세 조회
 * GET /api/admin/orders/:id
 */
exports.getOrderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'email', 'name', 'created_at']
                },
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'price', 'description']  // ✅ type 제거
                },
                {
                    model: DiagnosisResult,
                    as: 'diagnosisResult',
                    attributes: ['id', 'name', 'birth_date', 'mbti', 'created_at']
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

/**
 * ❌ 결제 취소 (토스페이먼츠 API 연동)
 * POST /api/admin/orders/:id/cancel
 */
exports.cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancelReason = '관리자 취소' } = req.body;

        console.log(`❌ 주문 취소 요청: ${id}`);

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
                message: '이미 환불된 주문입니다.'
            });
        }

        if (order.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: '완료된 주문만 취소할 수 있습니다.'
            });
        }

        if (!order.payment_key) {
            return res.status(400).json({
                success: false,
                message: 'payment_key가 없어 취소할 수 없습니다.'
            });
        }

        // 🔥 토스페이먼츠 API 취소 요청
        console.log('🔥 토스페이먼츠 취소 API 호출 중...');
        const cancelResult = await PaymentService.cancelPayment(
            order.payment_key,
            cancelReason
        );

        // ✅ DB 업데이트
        await order.update({
            status: 'cancelled',
            refunded_amount: order.amount,
            cancelled_at: new Date()
        });

        console.log('✅ 주문 취소 완료:', order.order_id);

        res.json({
            success: true,
            message: '결제가 취소되었습니다.',
            order,
            cancelResult
        });

    } catch (error) {
        console.error('❌ 주문 취소 에러:', error);
        res.status(500).json({
            success: false,
            message: error.message || '주문 취소 실패'
        });
    }
};

/**
 * 📊 주문 통계
 * GET /api/admin/orders/stats
 */
exports.getOrderStats = async (req, res) => {
    try {
        console.log('📊 주문 통계 조회 중...');

        // 전체 주문 수
        const totalOrders = await Order.count({
            where: { status: 'completed' }
        });

        // 전체 매출
        const totalRevenue = await Order.sum('amount', {
            where: { status: 'completed' }
        }) || 0;

        // 환불 금액
        const totalRefunded = await Order.sum('refunded_amount') || 0;

        // 순 매출
        const netRevenue = totalRevenue - totalRefunded;

        // 오늘 주문
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayOrders = await Order.count({
            where: {
                status: 'completed',
                paid_at: { [Op.gte]: today }
            }
        });

        const todayRevenue = await Order.sum('amount', {
            where: {
                status: 'completed',
                paid_at: { [Op.gte]: today }
            }
        }) || 0;

        // 이번 달
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const monthOrders = await Order.count({
            where: {
                status: 'completed',
                paid_at: { [Op.gte]: thisMonth }
            }
        });

        const monthRevenue = await Order.sum('amount', {
            where: {
                status: 'completed',
                paid_at: { [Op.gte]: thisMonth }
            }
        }) || 0;

        // 상태별 주문 수
        const statusCounts = await Order.findAll({
            attributes: [
                'status',
                [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        console.log('✅ 통계 조회 완료');

        res.json({
            success: true,
            stats: {
                total: {
                    orders: totalOrders,
                    revenue: totalRevenue,
                    refunded: totalRefunded,
                    netRevenue: netRevenue,
                    avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0
                },
                today: {
                    orders: todayOrders,
                    revenue: todayRevenue
                },
                thisMonth: {
                    orders: monthOrders,
                    revenue: monthRevenue
                },
                statusCounts: statusCounts.reduce((acc, item) => {
                    acc[item.status] = parseInt(item.count);
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('❌ 통계 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '통계 조회 실패',
            error: error.message
        });
    }
};