const { pool } = require('../config/database');
const crypto = require('crypto');

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

        const connection = await pool.getConnection();

        // 기존 결과 확인
        const [existing] = await connection.query(
            'SELECT id, free_diagnosis, premium_diagnosis FROM diagnosis_results WHERE input_hash = ?',
            [inputHash]
        );

        if (existing.length > 0) {
            // 업데이트
            if (diagnosisType === 'free') {
                await connection.query(
                    'UPDATE diagnosis_results SET free_diagnosis = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [freeDiagnosis, existing[0].id]
                );
            } else {
                await connection.query(
                    'UPDATE diagnosis_results SET premium_diagnosis = ?, order_id = ?, diagnosis_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [premiumDiagnosis, orderId, diagnosisType, existing[0].id]
                );
            }
            console.log(`💾 진단 결과 업데이트 완료 (ID: ${existing[0].id})`);
            connection.release();
            return existing[0].id;
        }

        // 신규 저장
        const [result] = await connection.query(
            `INSERT INTO diagnosis_results 
            (user_id, input_hash, name, birth_date, birth_time, gender, mbti, saju_data, free_diagnosis, premium_diagnosis, diagnosis_type, order_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                inputHash,
                sajuData.user.name,
                sajuData.user.birthDate,
                sajuData.user.birthTime,
                sajuData.user.gender,
                sajuData.user.mbti || null,
                JSON.stringify(sajuData),
                freeDiagnosis || null,
                premiumDiagnosis || null,
                diagnosisType,
                orderId || null
            ]
        );

        connection.release();
        console.log(`💾 진단 결과 저장 완료 (ID: ${result.insertId})`);
        return result.insertId;

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
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            'SELECT * FROM diagnosis_results WHERE input_hash = ?',
            [inputHash]
        );

        connection.release();
        return rows.length > 0 ? rows[0] : null;

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