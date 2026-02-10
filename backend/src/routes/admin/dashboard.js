const express = require('express');
const router = express.Router();
const { adminOnlyMiddleware } = require('../../middleware/authMiddleware');
const { Op } = require('sequelize');
const { sequelize } = require('../../../models/sequelize');

const User = require('../../../models/User');
const Order = require('../../../models/Order');
const TokenUsage = require('../../../models/TokenUsage'); // ⭐ 추가

router.use(adminOnlyMiddleware);

// 대시보드 통계
router.get('/stats', async (req, res) => {
    try {
        console.log('📊 대시보드 통계 조회 시작');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 7일 전 날짜
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // === 전체 통계 ===
        const totalUsers = await User.count();

        // ⭐ 총 사용 토큰
        const totalTokens = await TokenUsage.sum('tokens_used') || 0;

        const totalRevenue = await Order.sum('amount', {
            where: { status: 'completed' }
        }) || 0;

        const totalOrders = await Order.count();

        // === 일별 가입자 (최근 7일) ===
        const dailyUsers = await User.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // === 일별 매출 (최근 7일) ===
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
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // === 일별 주문 (최근 7일) ===
        const dailyOrders = await Order.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: {
                    [Op.gte]: sevenDaysAgo
                }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // ⭐ 일별 토큰 사용량 (최근 7일)
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
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        const data = {
            totalStats: {
                total_users: totalUsers,
                total_tokens: totalTokens, // ⭐ 총 사용 토큰
                total_revenue: Math.round(totalRevenue),
                total_orders: totalOrders
            },
            dailyUsers: dailyUsers,
            dailyRevenue: dailyRevenue,
            dailyOrders: dailyOrders,
            dailyTokens: dailyTokens // ⭐ 일별 토큰 사용량
        };

        console.log('✅ 대시보드 통계:', data);

        res.json({
            success: true,
            data: data
        });

    } catch (error) {
        console.error('❌ 대시보드 통계 조회 실패:', error);
        console.error('에러 상세:', error.stack);
        res.status(500).json({
            success: false,
            message: '통계 조회 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router;