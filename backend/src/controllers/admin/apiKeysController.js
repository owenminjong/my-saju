const { pool } = require('../../config/database');
const { encrypt, decrypt } = require('../../utils/encryption');

// API 키 목록 조회
exports.getApiKeys = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [apiKeys] = await connection.query(
            'SELECT id, service_name, is_active, created_at, updated_at FROM api_keys ORDER BY service_name'
        );

        // API 키는 마스킹 처리
        const maskedKeys = apiKeys.map(key => ({
            ...key,
            api_key_masked: '********************',
            has_key: false // 실제로는 키 존재 여부 체크
        }));

        connection.release();

        res.json({
            success: true,
            data: maskedKeys
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
        const { service_name, api_key, is_active } = req.body;

        if (!service_name || !api_key) {
            return res.status(400).json({
                success: false,
                message: '서비스명과 API 키는 필수입니다.'
            });
        }

        // 암호화
        const encryptedKey = encrypt(api_key);

        const connection = await pool.getConnection();

        // UPSERT (있으면 업데이트, 없으면 생성)
        const [result] = await connection.query(
            `INSERT INTO api_keys (service_name, api_key, is_active) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       api_key = VALUES(api_key),
       is_active = VALUES(is_active),
       updated_at = CURRENT_TIMESTAMP`,
            [service_name, encryptedKey, is_active !== undefined ? is_active : true]
        );

        connection.release();

        res.json({
            success: true,
            message: 'API 키가 저장되었습니다.',
            data: { id: result.insertId || result.affectedRows }
        });

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

// API 키 삭제
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