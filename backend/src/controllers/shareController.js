// backend/src/controllers/shareController.js
const kakaoShareService = require('../services/kakaoShareService');
const freeShareService = require('../services/freeShareService');

/**
 * GET /api/share/kakao-key
 * 카카오 JavaScript 키 조회 (프론트엔드 SDK 초기화용)
 */
exports.getKakaoKey = async (req, res) => {
    try {
        const kakaoKey = await kakaoShareService.getKakaoJsKey();

        res.json({
            success: true,
            data: {
                kakaoJsKey: kakaoKey
            }
        });

    } catch (error) {
        console.error('카카오 키 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '카카오 키 조회에 실패했습니다.'
        });
    }
};

/**
 * GET /api/share/free/:uniqueId
 * 무료 버전 공유 링크 조회 (세션)
 */
exports.getFreeResult = async (req, res) => {
    try {
        const { uniqueId } = req.params;

        const result = freeShareService.getFreeResult(req.session, uniqueId);

        res.json({
            success: true,
            data: result,
            isOwner: true // 세션이 있다는 건 본인
        });

    } catch (error) {
        console.error('무료 결과 조회 오류:', error);
        res.status(404).json({
            success: false,
            message: error.message || '결과를 찾을 수 없습니다.'
        });
    }
};