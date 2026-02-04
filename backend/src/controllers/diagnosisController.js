const sajuService = require('../services/sajuService');
const { generateFreePrompt } = require('../services/promptService');
const { callClaudeAPIFree, callClaudeAPIPremium } = require('../services/claudeService');
const { generateCharacterImage } = require('../services/imageService'); // ✅ 추가
const { User, Order } = require('../../models');
const crypto = require('crypto');

const generateFreeDiagnosis = async (req, res) => {
    try {
        const { name, year, month, day, hour, minute, isLunar, gender, mbti } = req.body;

        if (!name || !year || !month || !day || !mbti) {
            return res.status(400).json({
                success: false,
                message: '이름, 생년월일, MBTI는 필수입니다.'
            });
        }

        console.log('\n' + '='.repeat(80));
        console.log('📋 무료 베이직 진단');
        console.log('='.repeat(80) + '\n');

        // 1️⃣ 사주 계산
        console.log('🔮 사주 계산 중...');
        const sajuResult = await sajuService.analyzeBasicSaju({
            name,
            year,
            month,
            day,
            hour: hour || 0,
            minute: minute || 0,
            isLunar: isLunar || false
        });
        console.log('✅ 사주 계산 완료\n');

        // 🎨 캐릭터 이미지 생성 (수정)
        console.log('🎨 캐릭터 이미지 생성 중...');
        const imageResult = await generateCharacterImage({
            user: {
                ...sajuResult.user,
                gender: gender || 'M'
            },
            year: year,      // ✅ req.body에서 받은 year 전달
            month: month,    // ✅ req.body에서 받은 month 전달
            hour: hour || 0, // ✅ req.body에서 받은 hour 전달
            saju: sajuResult.saju // ✅ 사주 정보도 전달 (띠 확인용)
        });
        console.log('✅ 이미지 생성 완료\n');

        // 2️⃣ 프롬프트 생성
        const promptData = {
            user: {
                ...sajuResult.user,
                gender: gender || 'M'
            },
            saju: sajuResult.saju,
            elements: sajuResult.elements,
            dayMaster: sajuResult.dayMaster,
            fields: sajuResult.fields,
            mbti
        };

        const prompt = await generateFreePrompt(promptData);

        const diagnosis = await callClaudeAPIFree(
            prompt.systemPrompt,
            prompt.userPrompt,
            null
        );

        console.log('✅ 무료 진단 완료!\n');

        const { v4: uuidv4 } = require('uuid');
        const uniqueId = uuidv4();
        console.log('🔑 고유 ID 생성:', uniqueId);

        const resultData = {
            uniqueId,
            name,
            sajuData: sajuResult,
            diagnosis: diagnosis.text,
            usage: diagnosis.usage,
            metadata: prompt.metadata,
            characterImage: imageResult.success ? imageResult.imagePath : null, // ✅ 이미지 추가
            imageMetadata: imageResult.metadata, // ✅ 이미지 메타데이터
            createdAt: new Date(),
            isPaid: false,
            mbti
        };

        req.session.freeResult = resultData;

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // 4️⃣ 응답
        res.json({
            success: true,
            message: '무료 베이직 진단이 완료되었습니다.',
            uniqueId,
            sajuData: sajuResult,
            diagnosis: diagnosis.text,
            usage: diagnosis.usage,
            metadata: prompt.metadata,
            characterImage: imageResult.success ? imageResult.imagePath : null, // ✅ 이미 있음
            imageMetadata: imageResult.metadata
        });

    } catch (error) {
        console.error('무료 진단 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '진단 생성 중 오류가 발생했습니다.'
        });
    }
};

module.exports = {
    generateFreeDiagnosis,
    // generatePremiumDiagnosis
};