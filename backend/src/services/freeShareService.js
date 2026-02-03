// backend/src/services/freeShareService.js

/**
 * 세션에서 무료 버전 결과 조회
 */
const getFreeResult = (session) => {
    try {
        const freeResult = session.freeResult;

        if (!freeResult) {
            throw new Error('공유할 사주 데이터가 없습니다. 먼저 사주를 조회해주세요.');
        }

        return freeResult;

    } catch (error) {
        console.error('무료 결과 조회 오류:', error);
        throw error;
    }
};

module.exports = {
    getFreeResult
};