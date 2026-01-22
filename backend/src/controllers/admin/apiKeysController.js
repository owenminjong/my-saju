const { pool } = require('../../config/database');
const { encrypt, decrypt } = require('../../utils/encryption');

// API 키 목록 조회 (카테고리별)
exports.getApiKeys = async (req, res) => {
    try {
        const { category } = req.query; // 'ai', 'payment', 'social'
        const connection = await pool.getConnection();

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        const [apiKeys] = await connection.query(
            `SELECT id, service_name, provider, category, is_active, created_at, updated_at 
       FROM api_keys ${whereClause} 
       ORDER BY category, service_name`,
            params
        );

        connection.release();

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
        const connection = await pool.getConnection();

        const [apiKeys] = await connection.query(
            'SELECT * FROM api_keys WHERE id = ?',
            [id]
        );

        connection.release();

        if (apiKeys.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'API 키를 찾을 수 없습니다.'
            });
        }

        const apiKey = apiKeys[0];

        // 복호화
        apiKey.api_key = decrypt(apiKey.api_key);

        res.json({
            success: true,
            data: apiKey
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

        const connection = await pool.getConnection();

        if (id) {
            // 수정
            const [result] = await connection.query(
                `UPDATE api_keys 
         SET api_key = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
                [encryptedKey, is_active !== undefined ? is_active : true, id]
            );

            connection.release();

            if (result.affectedRows === 0) {
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
            const [result] = await connection.query(
                `INSERT INTO api_keys (service_name, provider, category, api_key, is_active) 
         VALUES (?, ?, ?, ?, ?)`,
                [service_name, provider, category, encryptedKey, is_active !== undefined ? is_active : true]
            );

            connection.release();

            res.status(201).json({
                success: true,
                message: 'API 키가 생성되었습니다.',
                data: { id: result.insertId }
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

// 나머지 함수들은 동일...
exports.toggleApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE api_keys SET is_active = ? WHERE id = ?',
            [is_active, id]
        );

        connection.release();

        if (result.affectedRows === 0) {
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

exports.deleteApiKey = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'DELETE FROM api_keys WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
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