// src/services/imageService.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// 이미지 베이스 경로
const BASE_PATH = process.env.CHARACTER_IMAGE_BASE_PATH || path.join(__dirname, '../../public/images');
const CHARACTER_PATH = path.join(BASE_PATH, '남녀캐릭터');
const BACKGROUND_PATH = path.join(BASE_PATH, '배경');
const OUTPUT_PATH = path.join(__dirname, '../../public/generated-images');

// Output 폴더가 없으면 생성
async function ensureOutputDir() {
    try {
        await fs.access(OUTPUT_PATH);
    } catch {
        await fs.mkdir(OUTPUT_PATH, { recursive: true });
    }
}

/**
 * 띠 매핑 (12지지)
 */
function getZodiacAnimal(year) {
    const animals = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'];
    return animals[year % 12];
}

/**
 * 시간대 매핑 (12시진)
 */
function getTimeOfDay(hour) {
    const times = [
        { name: '자시', start: 23, end: 1 },
        { name: '축시', start: 1, end: 3 },
        { name: '인시', start: 3, end: 5 },
        { name: '묘시', start: 5, end: 7 },
        { name: '진시', start: 7, end: 9 },
        { name: '사시', start: 9, end: 11 },
        { name: '오시', start: 11, end: 13 },
        { name: '미시', start: 13, end: 15 },
        { name: '신시', start: 15, end: 17 },
        { name: '유시', start: 17, end: 19 },
        { name: '술시', start: 19, end: 21 },
        { name: '해시', start: 21, end: 23 }
    ];

    for (let time of times) {
        if (hour >= time.start && hour < time.end) {
            return time.name;
        }
    }
    return '';
}

/**
 * 계절 매핑 (생월 기준)
 */
function getSeason(month) {
    if (month >= 3 && month <= 5) return '봄';
    if (month >= 6 && month <= 8) return '여름';
    if (month >= 9 && month <= 11) return '가을';
    return '겨울';
}

/**
 * 캐릭터 이미지 경로 생성
 * 예: "캐더 남.png"
 */
function getCharacterImagePath(gender, zodiac) {
    const genderStr = gender === 'M' ? '남' : '여';
    const filename = `${zodiac}띠 ${genderStr}.png`;

    console.log(`   - 파일명: ${filename}`);

    return path.join(CHARACTER_PATH, filename);
}

/**
 * 배경 이미지 경로 생성
 * 예: "가을 낮.png"
 */
function getBackgroundImagePath(season, timeOfDay) {
    // 시간대를 낮/밤으로 변환
    const isDaytime = ['진시', '사시', '오시', '미시', '신시'].includes(timeOfDay);
    const timeStr = isDaytime ? '낮' : '밤';

    const filename = `${season} ${timeStr}.png`;
    return path.join(BACKGROUND_PATH, filename);
}

/**
 * 캐릭터 이미지 생성
 */
async function generateCharacterImage(sajuData) {
    try {
        await ensureOutputDir();

        const { user, year, month, hour, saju } = sajuData;
        const gender = user?.gender || 'M';

        // ✅ 띠는 사주의 년지(year branch)에서 가져오기
        const zodiac = saju?.year?.branch?.animal || getZodiacAnimal(year);
        const season = getSeason(month);
        const timeOfDay = getTimeOfDay(hour || 0);

        console.log('🎨 이미지 생성 정보:');
        console.log(`   - 연도: ${year}`);
        console.log(`   - 띠: ${zodiac}`);
        console.log(`   - 계절: ${season}`);
        console.log(`   - 시간: ${timeOfDay}`);
        console.log(`   - 성별: ${gender}`);

        // 2. 이미지 경로 확인
        const bgPath = getBackgroundImagePath(season, timeOfDay);
        const charPath = getCharacterImagePath(gender, zodiac);

        console.log(`   - 배경: ${bgPath}`);
        console.log(`   - 캐릭터: ${charPath}`);

        // 파일 존재 확인
        try {
            await fs.access(bgPath);
            await fs.access(charPath);
        } catch (error) {
            console.error('❌ 이미지 파일을 찾을 수 없습니다:', error.message);
            return {
                success: false,
                message: '이미지를 찾을 수 없습니다.',
                defaultImage: true
            };
        }

        // 3. Sharp로 이미지 합성
        const outputFilename = `${Date.now()}_${gender}_${zodiac}.png`;
        const outputPath = path.join(OUTPUT_PATH, outputFilename);

        const background = sharp(bgPath);
        const bgMetadata = await background.metadata();

        const character = await sharp(charPath)
            .resize(bgMetadata.width, bgMetadata.height, {
                fit: 'contain',
                position: 'center'
            })
            .toBuffer();

        await background
            .composite([
                {
                    input: character,
                    gravity: 'center'
                }
            ])
            .toFile(outputPath);

        console.log('✅ 이미지 합성 완료:', outputPath);

        const webPath = `/generated-images/${outputFilename}`;

        return {
            success: true,
            imagePath: webPath,
            localPath: outputPath,
            metadata: {
                zodiac,
                season,
                timeOfDay,
                gender
            }
        };

    } catch (error) {
        console.error('❌ 이미지 생성 오류:', error);
        return {
            success: false,
            message: error.message,
            defaultImage: true
        };
    }
}

/**
 * Base64로 이미지 반환 (선택적)
 */
async function generateCharacterImageBase64(sajuData) {
    try {
        const result = await generateCharacterImage(sajuData);

        if (!result.success) {
            return result;
        }

        const imageBuffer = await fs.readFile(result.localPath);
        const base64 = imageBuffer.toString('base64');

        return {
            success: true,
            imageBase64: `data:image/png;base64,${base64}`,
            metadata: result.metadata
        };

    } catch (error) {
        console.error('❌ Base64 변환 오류:', error);
        throw error;
    }
}

module.exports = {
    generateCharacterImage,
    generateCharacterImageBase64
};