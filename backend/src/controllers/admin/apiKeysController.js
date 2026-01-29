const { ApiKey } = require('../../models');
const { encrypt, decrypt } = require('../../utils/encryption');
const { Op } = require('sequelize');

// API 키 목록 조회 (카테고리별)
exports.getApiKeys = async (req, res) => {
    try {
        const { category } = req.query; // 'ai', 'payment', 'social'

        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }

        const apiKeys = await ApiKey.findAll({
            where: whereClause,
            attributes: ['id', 'service_name', 'provider', 'category', 'is_active', 'created_at', 'updated_at'],
            order: [['category', 'ASC'], ['service_name', 'ASC']]
        });

        res.json({
            success: true,
            data: apiKeys
        });

    } catch (error) {
        console.error('API 키 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'API 키 목록 조회에 실패했습니다.'
        });
    }
};

// API 키 상세 조회 (복호화된 키 반환)
exports.getApiKey = async (req, res) => {
    try {
        const { id } = req.params;

        const apiKey = await ApiKey.findByPk(id);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                message: 'API 키를 찾을 수 없습니다.'
            });
        }

        // 복호화
        const decryptedApiKey = {
            ...apiKey.toJSON(),
            api_key: decrypt(apiKey.api_key)
        };

        res.json({
            success: true,
            data: decryptedApiKey
        });

    } catch (error) {
        console.error('API 키 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: 'API 키 조회에 실패했습니다.'
        });
    }
};

// API 키 생성/수정
exports.upsertApiKey = async (req, res) => {
    try {
        const { id, service_name, provider, category, api_key, is_active } = req.body;

        if (!service_name || !api_key || !category) {
            return res.status(400).json({
                success: false,
                message: '서비스명, 카테고리, API 키는 필수입니다.'
            });
        }

        // 암호화
        const encryptedKey = encrypt(api_key);

        if (id) {
            // 수정
            const [affectedRows] = await ApiKey.update(
                {
                    api_key: encryptedKey,
                    is_active: is_active !== undefined ? is_active : true
                },
                { where: { id } }
            );

            if (affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'API 키를 찾을 수 없습니다.'
                });
            }

            res.json({
                success: true,
                message: 'API 키가 수정되었습니다.'
            });
        } else {
            // 생성
            const newApiKey = await ApiKey.create({
                service_name,
                provider,
                category,
                api_key: encryptedKey,
                is_active: is_active !== undefined ? is_active : true
            });

            res.status(201).json({
                success: true,
                message: 'API 키가 생성되었습니다.',
                data: { id: newApiKey.id }
            });
        }

    } catch (error) {
        console.error('API 키 저장 오류:', error);
        res.status(500).json({
            success: false,
            message: 'API 키 저장에 실패했습니다.'
        });
    }
};

// API 키 활성화/비활성화 토글
exports.toggleApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const [affectedRows] = await ApiKey.update(
            { is_active },
            { where: { id } }
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'API 키를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: 'API 키 상태가 변경되었습니다.'
        });

    } catch (error) {
        console.error('API 키 상태 변경 오류:', error);
        res.status(500).json({
            success: false,
            message: 'API 키 상태 변경에 실패했습니다.'
        });
    }
};

// API 키 삭제
exports.deleteApiKey = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await ApiKey.destroy({
            where: { id }
        });

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'API 키를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: 'API 키가 삭제되었습니다.'
        });

    } catch (error) {
        console.error('API 키 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: 'API 키 삭제에 실패했습니다.'
        });
    }
};
