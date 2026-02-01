const { DiagnosisResult } = require('../../models');
const crypto = require('crypto');
const { Op } = require('sequelize');

/**
 * 입력 해시 생성
 */
function generateInputHash(sajuData, mbti) {
    const { user } = sajuData;
    const hashString = `${user.birthDate}-${user.birthTime}-${user.gender}-${user.name}-${mbti}`;
    return crypto.createHash('sha256').update(hashString).digest('hex');
}

/**
 * 진단 결과 저장
 */
async function saveDiagnosisResult(data) {
    try {
        const {
            userId,
            inputHash,
            sajuData,
            freeDiagnosis,
            premiumDiagnosis,
            diagnosisType,
            orderId
        } = data;

        // 기존 결과 확인
        const existing = await DiagnosisResult.findOne({
            where: { input_hash: inputHash }
        });

        if (existing) {
            // 업데이트
            const updateData = {};

            if (diagnosisType === 'free') {
                updateData.free_diagnosis = freeDiagnosis;
            } else {
                updateData.premium_diagnosis = premiumDiagnosis;
                updateData.order_id = orderId;
                updateData.diagnosis_type = diagnosisType;
            }

            await existing.update(updateData);

            console.log(`💾 진단 결과 업데이트 완료 (ID: ${existing.id})`);
            return existing.id;
        }

        // 신규 저장
        const result = await DiagnosisResult.create({
            user_id: userId,
            input_hash: inputHash,
            name: sajuData.user.name,
            birth_date: sajuData.user.birthDate,
            birth_time: sajuData.user.birthTime,
            gender: sajuData.user.gender,
            mbti: sajuData.user.mbti || null,
            saju_data: sajuData,
            free_diagnosis: freeDiagnosis || null,
            premium_diagnosis: premiumDiagnosis || null,
            diagnosis_type: diagnosisType,
            order_id: orderId || null
        });

        console.log(`💾 진단 결과 저장 완료 (ID: ${result.id})`);
        return result.id;

    } catch (error) {
        console.error('❌ 진단 결과 저장 오류:', error);
        throw error;
    }
}

/**
 * 저장된 진단 결과 조회
 */
async function getDiagnosisResult(inputHash) {
    try {
        const result = await DiagnosisResult.findOne({
            where: { input_hash: inputHash }
        });

        return result;

    } catch (error) {
        console.error('❌ 진단 결과 조회 오류:', error);
        throw error;
    }
}

module.exports = {
    generateInputHash,
    saveDiagnosisResult,
    getDiagnosisResult
};