const express = require('express');
const router = express.Router();
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware');
const { Op } = require('sequelize');
const { sequelize } = require('../../../models/sequelize');

const TokenUsage = require('../../../models/TokenUsage');
const User = require('../../../models/User');
const Order = require('../../../models/Order');

// 관리자 인증 미들웨어
router.use(adminOnlyMiddleware);

// 토큰 사용 내역 목록 조회
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, type = 'all', search = '', searchType = 'all' } = req.query;
        const offset = (page - 1) * limit;

        console.log('📊 토큰 사용 내역 조회:', { page, limit, type, search, searchType });

        let paidUsages = [];
        let freeUsages = [];
        let totalPaidCount = 0;
        let totalFreeCount = 0;

        // 검색 조건 설정
        let userWhere = {};
        let orderWhere = {};
        const hasUserSearch = search && (searchType === 'user' || searchType === 'all');
        const hasOrderSearch = search && (searchType === 'order' || searchType === 'all');

        if (hasUserSearch) {
            userWhere = {
                [Op.or]: [
                    { name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        if (hasOrderSearch) {
            orderWhere = {
                order_id: { [Op.like]: `%${search}%` }
            };
        }

        // === 유료 사용자: order_id로 그룹화 ===
        if (type === 'all' || type === 'paid') {
            const paidWhereClause = {
                order_id: { [Op.ne]: null }
            };

            paidUsages = await TokenUsage.findAll({
                attributes: [
                    'order_id',
                    'user_id',
                    [sequelize.fn('SUM', sequelize.col('tokens_used')), 'total_tokens'],
                    [sequelize.fn('COUNT', sequelize.col('token_usage.id')), 'usage_count'],
                    [sequelize.fn('MIN', sequelize.col('token_usage.created_at')), 'first_used_at'],
                    [sequelize.fn('MAX', sequelize.col('token_usage.created_at')), 'last_used_at']
                ],
                where: paidWhereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'provider'],
                        where: hasUserSearch ? userWhere : undefined,
                        required: hasUserSearch // ⭐ 사용자 검색 시 INNER JOIN
                    },
                    {
                        model: Order,
                        as: 'order',
                        attributes: ['id', 'order_id', 'amount', 'status', 'created_at'],
                        where: hasOrderSearch ? orderWhere : undefined,
                        required: hasOrderSearch // ⭐ 주문 검색 시 INNER JOIN
                    }
                ],
                group: ['order_id', 'user_id', 'user.id', 'order.id'],
                order: [[sequelize.fn('MAX', sequelize.col('token_usage.created_at')), 'DESC']],
                limit: type === 'all' ? null : parseInt(limit),
                offset: type === 'all' ? null : parseInt(offset),
                raw: false,
                nest: true
            });

            // 총 개수 (검색 필터 적용)
            const countQuery = await TokenUsage.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('token_usage.order_id'))), 'count']
                ],
                where: paidWhereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: [],
                        where: hasUserSearch ? userWhere : undefined,
                        required: hasUserSearch
                    },
                    {
                        model: Order,
                        as: 'order',
                        attributes: [],
                        where: hasOrderSearch ? orderWhere : undefined,
                        required: hasOrderSearch
                    }
                ],
                raw: true
            });
            totalPaidCount = parseInt(countQuery[0]?.count || 0);
        }

        // === 무료 사용자: 개별 조회 ===
        if (type === 'all' || type === 'free') {
            const freeWhereClause = { order_id: null };

            // ⭐ 사용자 검색 시 user_id가 null이 아닌 것만 조회
            if (hasUserSearch) {
                freeWhereClause.user_id = { [Op.ne]: null };
            }

            freeUsages = await TokenUsage.findAll({
                where: freeWhereClause,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email', 'provider'],
                        where: hasUserSearch ? userWhere : undefined,
                        required: hasUserSearch // ⭐ 사용자 검색 시 INNER JOIN
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: type === 'all' ? null : parseInt(limit),
                offset: type === 'all' ? null : parseInt(offset)
            });

            // 총 개수
            totalFreeCount = await TokenUsage.count({
                where: freeWhereClause,
                include: hasUserSearch ? [
                    {
                        model: User,
                        as: 'user',
                        where: userWhere,
                        required: true
                    }
                ] : []
            });
        }

        // === 응답 데이터 조합 ===
        let usages = [];

        if (type === 'all') {
            // 유료 변환
            const paidList = paidUsages.map(item => ({
                type: 'paid',
                order_id: item.order_id,
                user_id: item.user_id,
                user: item.user,
                order: item.order,
                total_tokens: parseInt(item.dataValues.total_tokens),
                usage_count: parseInt(item.dataValues.usage_count),
                first_used_at: item.dataValues.first_used_at,
                last_used_at: item.dataValues.last_used_at
            }));

            // 무료 변환
            const freeList = freeUsages.map(item => ({
                type: 'free',
                id: item.id,
                user_id: item.user_id,
                user: item.user,
                tokens_used: item.tokens_used,
                api_type: item.api_type,
                created_at: item.created_at
            }));

            // 전체 합친 후 시간순 정렬
            const combined = [...paidList, ...freeList].sort((a, b) => {
                const dateA = new Date(a.last_used_at || a.created_at);
                const dateB = new Date(b.last_used_at || b.created_at);
                return dateB - dateA;
            });

            // 페이징 적용
            usages = combined.slice(offset, offset + parseInt(limit));

        } else if (type === 'paid') {
            usages = paidUsages.map(item => ({
                type: 'paid',
                order_id: item.order_id,
                user_id: item.user_id,
                user: item.user,
                order: item.order,
                total_tokens: parseInt(item.dataValues.total_tokens),
                usage_count: parseInt(item.dataValues.usage_count),
                first_used_at: item.dataValues.first_used_at,
                last_used_at: item.dataValues.last_used_at
            }));
        } else if (type === 'free') {
            usages = freeUsages.map(item => ({
                type: 'free',
                id: item.id,
                user_id: item.user_id,
                user: item.user,
                tokens_used: item.tokens_used,
                api_type: item.api_type,
                created_at: item.created_at
            }));
        }

        const totalCount = type === 'paid' ? totalPaidCount :
            type === 'free' ? totalFreeCount :
                totalPaidCount + totalFreeCount;

        console.log('✅ 토큰 사용 내역 조회 완료:', usages.length, '/ 전체:', totalCount);

        res.json({
            success: true,
            data: usages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('❌ 토큰 사용 내역 조회 실패:', error);
        console.error('에러 상세:', error.stack);
        res.status(500).json({
            success: false,
            message: '토큰 사용 내역 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

// 특정 주문의 토큰 사용 상세 조회
router.get('/order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        console.log('🔍 주문별 토큰 상세 조회:', orderId);

        const usages = await TokenUsage.findAll({
            where: { order_id: orderId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        const total = usages.reduce((sum, item) => sum + item.tokens_used, 0);

        res.json({
            success: true,
            data: {
                order_id: orderId,
                usages: usages,
                total_tokens: total,
                count: usages.length
            }
        });

    } catch (error) {
        console.error('❌ 주문별 토큰 상세 조회 실패:', error);
        res.status(500).json({
            success: false,
            message: '토큰 상세 조회 중 오류가 발생했습니다.'
        });
    }
});

module.exports = router;