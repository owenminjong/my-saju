// src/controllers/admin/usersController.js

const { User, Order, Product, TokenUsage, DiagnosisResult } = require('../../../models');
const { Op } = require('sequelize');

// 회원 목록 조회 (페이징, 검색, 필터)
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * limit;

        // WHERE 조건 구성
        const whereClause = {};

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (status) {
            whereClause.status = status;
        }

        // 회원 목록 조회
        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            attributes: ['id', 'uuid', 'email', 'name', 'status', 'created_at', 'updated_at'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                users: rows,
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
const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;

        // 회원 정보 조회 (주문, 토큰 사용 내역 포함)
        const user = await User.findByPk(id, {
            include: [
                {
                    model: Order,
                    as: 'orders',
                    include: [
                        {
                            model: Product,
                            as: 'Product',
                            attributes: ['id', 'name', 'price']
                        }
                    ],
                    order: [['created_at', 'DESC']]
                },
                {
                    model: TokenUsage,
                    as: 'tokenUsages',
                    limit: 10,
                    order: [['created_at', 'DESC']]
                },
                {
                    model: DiagnosisResult,
                    as: 'diagnosisResults',
                    limit: 10,
                    order: [['created_at', 'DESC']]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '회원을 찾을 수 없습니다.'
            });
        }

        // 응답 데이터 구조 변환
        const orders = user.orders.map(order => ({
            id: order.id,
            amount: order.amount,
            status: order.status,
            created_at: order.created_at,
            updated_at: order.updated_at,
            product_name: order.Product?.name || '상품명 없음'
        }));

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    uuid: user.uuid,
                    provider: user.provider,
                    provider_id: user.provider_id,
                    email: user.email || null,
                    name: user.name,
                    phone: user.phone,
                    gender: user.gender,
                    birth_date: user.birth_date,
                    birth_time: user.birth_time,
                    role: user.role,
                    status: user.status,
                    created_at: user.created_at,
                    last_login_at: user.last_login_at,
                    updated_at: user.updated_at
                },
                orders: orders,
                tokens: user.tokenUsages
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

// 회원 상태 변경
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'banned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '유효하지 않은 상태값입니다.'
            });
        }

        const [updated] = await User.update(
            { status },
            { where: { id } }
        );

        if (updated === 0) {
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
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await User.destroy({
            where: { id }
        });

        if (deleted === 0) {
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

// ⭐ Export (이 부분이 가장 중요!)
module.exports = {
    getUsers,
    getUserDetail,
    updateUserStatus,
    deleteUser
};
