// backend/routes/share.js

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/**
 * 데이터를 해시로 변환 (짧은 코드)
 */
router.post('/api/share/encode-hash', (req, res) => {
    try {
        const sajuData = req.session.sajuResult;

        if (!sajuData) {
            return res.status(400).json({
                success: false,
                message: '사주 데이터가 없습니다.'
            });
        }

        // 원본 데이터를 JSON으로 직렬화
        const dataString = JSON.stringify(sajuData);

        // Base64 URL-safe 인코딩 (더 짧게)
        const encoded = Buffer.from(dataString)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, ''); // 패딩 제거

        res.json({
            success: true,
            data: {
                encodedData: encoded
            }
        });

    } catch (error) {
        console.error('인코딩 실패:', error);
        res.status(500).json({
            success: false,
            message: '인코딩 실패'
        });
    }
});

/**
 * 해시를 원본 데이터로 복원
 */
router.post('/api/share/decode-hash', (req, res) => {
    try {
        let encoded = req.body.encodedData;

        // URL-safe Base64를 일반 Base64로 복원
        encoded = encoded
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // 패딩 추가
        while (encoded.length % 4) {
            encoded += '=';
        }

        // 디코딩
        const dataString = Buffer.from(encoded, 'base64').toString('utf-8');
        const sajuData = JSON.parse(dataString);

        res.json({
            success: true,
            data: sajuData
        });

    } catch (error) {
        console.error('디코딩 실패:', error);
        res.status(500).json({
            success: false,
            message: '디코딩 실패'
        });
    }
});

module.exports = router;