// backend/src/services/freeShareService.js

/**
 * 세션에서 무료 버전 결과 조회
 */
const getFreeResult = (session, uniqueId) => {
    try {
        const freeResult = session.freeResult;

        if (!freeResult) {
            throw new Error('결과를 찾을 수 없습니다. 세션이 만료되었을 수 있습니다.');
        }

        if (freeResult.uniqueId !== uniqueId) {
            throw new Error('일치하는 결과를 찾을 수 없습니다.');
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