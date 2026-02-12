// src/services/imageService.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// 이미지 베이스 경로
const BASE_PATH = process.env.CHARACTER_IMAGE_BASE_PATH || path.join(__dirname, '../../public/images');
const CHARACTER_PATH = path.join(BASE_PATH, '남녀캐릭터');
const BACKGROUND_PATH = path.join(BASE_PATH, '배경');
const OUTPUT_PATH = path.join(__dirname, '../../public/generated-images');

// ✅ 생성 중인 이미지 추적 (동시 요청 방지)
const generatingImages = new Map();

// Output 폴더가 없으면 생성
async function ensureOutputDir() {
    try {
        await fs.access(OUTPUT_PATH);
    } catch {
        await fs.mkdir(OUTPUT_PATH, { recursive: true });
    }
}

/**
 * 띠 매핑 (12지지) - 사주에서 가져오므로 백업용
 */
function getZodiacAnimal(year) {
    const animals = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'];
    return animals[year % 12];
}

/**
 * 천간 → 색상 매핑
 */
function getColorFromSky(skyChar) {
    const colorMap = {
        '갑': '파랑',  // 甲 - 양목
        '을': '파랑',  // 乙 - 음목
        '병': '빨강',  // 丙 - 양화
        '정': '빨강',  // 丁 - 음화
        '무': '금',    // 戊 - 양토
        '기': '금',    // 己 - 음토
        '경': '하양',  // 庚 - 양금 (2000년 흰 용)
        '신': '하양',  // 辛 - 음금
        '임': '검정',  // 壬 - 양수
        '계': '검정'   // 癸 - 음수
    };

    return colorMap[skyChar] || '검정';
}

/**
 * 12시진 → 4시간대 매핑
 */
function mapTimeOfDay(timeOfDay) {
    const timeMap = {
        '자시': '밤',    // 23-01
        '축시': '밤',    // 01-03
        '인시': '아침',  // 03-05
        '묘시': '아침',  // 05-07
        '진시': '아침',  // 07-09
        '사시': '낮',    // 09-11
        '오시': '낮',    // 11-13
        '미시': '낮',    // 13-15
        '신시': '낮',    // 15-17
        '유시': '저녁',  // 17-19
        '술시': '저녁',  // 19-21
        '해시': '밤'     // 21-23
    };
    return timeMap[timeOfDay] || '낮';
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

    // 자시 예외처리 (23시)
    if (hour === 23) return '자시';

    return '오시'; // 기본값
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
 */
function getCharacterImagePath(gender, zodiac, color) {
    const genderStr = gender === 'M' ? '남' : '여';
    const folderName = `${zodiac}띠 ${genderStr}`;
    const filename = `${color}.png`;
    return path.join(CHARACTER_PATH, folderName, filename);
}

/**
 * 배경 이미지 경로 생성
 */
function getBackgroundImagePath(season, timeOfDay4) {
    const filename = `${season} ${timeOfDay4}.png`;
    return path.join(BACKGROUND_PATH, filename);
}

/**
 * ✅ 실제 이미지 생성 로직
 */
async function createImage(bgPath, charPath, outputPath) {
    console.log('   🎨 이미지 합성 시작...');

    // ✅ 1. 배경 리사이징
    const resizedBg = await sharp(bgPath)
        .resize(800, 800, {
            fit: 'cover',
            position: 'center'
        })
        .toBuffer();

    // ✅ 2. 캐릭터 리사이징 (크기 조절: 800 → 500~600)
    const characterBuffer = await sharp(charPath)
        .resize(500, 500, {  // ✅ 800 → 500으로 축소 (62.5% 크기)
            fit: 'contain',
            position: 'center',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();

    // ✅ 3. 합성 (캐릭터를 하단 중앙에 배치)
    await sharp(resizedBg)
        .composite([
            {
                input: characterBuffer,
                gravity: 'south',  // ✅ center → south (하단 중앙)
                blend: 'over'
            }
        ])
        .jpeg({
            quality: 85,
            progressive: true
        })
        .toFile(outputPath);

    console.log('   ✅ 이미지 합성 완료');
}

/**
 * ✅ 캐릭터 이미지 생성 (캐싱 + 동시 요청 처리)
 */
async function generateCharacterImage(sajuData) {
    try {
        await ensureOutputDir();

        const { user, year, month, hour, saju } = sajuData;
        const gender = user?.gender || 'M';
        const genderStr = gender === 'M' ? '남' : '여';

        // 1️⃣ 데이터 계산
        const zodiac = saju?.year?.branch?.animal || getZodiacAnimal(year);
        const skyChar = saju?.year?.stem?.char;  // 천간 가져오기
        const color = getColorFromSky(skyChar);  // 색상 결정

        const season = getSeason(month);
        const timeOfDay12 = getTimeOfDay(hour || 0);
        const timeOfDay4 = mapTimeOfDay(timeOfDay12);

        console.log('🎨 이미지 생성 정보:');
        console.log(`   - 연도: ${year}`);
        console.log(`   - 천간: ${skyChar}`);
        console.log(`   - 색상: ${color}`);
        console.log(`   - 띠: ${zodiac}`);
        console.log(`   - 계절: ${season}`);
        console.log(`   - 시간(12시진): ${timeOfDay12}`);
        console.log(`   - 시간(4단계): ${timeOfDay4}`);
        console.log(`   - 성별: ${genderStr}`);

        // 2️⃣ 파일명 생성 (캐시 키에 색상 추가)
        const outputFilename = `${season}_${timeOfDay4}_${genderStr}_${color}_${zodiac}.jpg`;
        const outputPath = path.join(OUTPUT_PATH, outputFilename);
        const webPath = `/generated-images/${outputFilename}`;

        console.log(`   - 파일명: ${outputFilename}`);

        // 3️⃣ 파일 존재 확인 (캐시 히트)
        try {
            await fs.access(outputPath);
            console.log('   ✅ 캐시된 이미지 사용');
            return {
                success: true,
                imagePath: webPath,
                localPath: outputPath,
                cached: true,
                metadata: {
                    zodiac,
                    color,
                    skyChar,
                    season,
                    timeOfDay: timeOfDay4,
                    gender: genderStr
                }
            };
        } catch {
            // 파일 없음 - 생성 필요
        }

        // 4️⃣ 동시 요청 확인 (이미 생성 중인지)
        if (generatingImages.has(outputFilename)) {
            console.log('   ⏳ 다른 요청이 생성 중 - 대기...');
            await generatingImages.get(outputFilename);

            return {
                success: true,
                imagePath: webPath,
                localPath: outputPath,
                cached: true,
                metadata: {
                    zodiac,
                    color,
                    skyChar,
                    season,
                    timeOfDay: timeOfDay4,
                    gender: genderStr
                }
            };
        }

        // 5️⃣ 이미지 생성 시작
        const generatePromise = (async () => {
            try {
                // 이미지 경로 확인
                const bgPath = getBackgroundImagePath(season, timeOfDay4);
                const charPath = getCharacterImagePath(gender, zodiac, color);

                console.log(`   - 배경: ${bgPath}`);
                console.log(`   - 캐릭터: ${charPath}`);

                // 파일 존재 확인
                try {
                    await fs.access(bgPath);
                } catch {
                    throw new Error(`배경 이미지를 찾을 수 없습니다: ${bgPath}`);
                }

                try {
                    await fs.access(charPath);
                } catch {
                    throw new Error(`캐릭터 이미지를 찾을 수 없습니다: ${charPath}`);
                }

                // 이미지 생성
                await createImage(bgPath, charPath, outputPath);

                return {
                    success: true,
                    imagePath: webPath,
                    localPath: outputPath,
                    cached: false,
                    metadata: {
                        zodiac,
                        color,
                        skyChar,
                        season,
                        timeOfDay: timeOfDay4,
                        gender: genderStr
                    }
                };

            } catch (error) {
                console.error('   ❌ 이미지 생성 실패:', error.message);
                throw error;
            } finally {
                // 생성 완료 - Map에서 제거
                generatingImages.delete(outputFilename);
            }
        })();

        // 생성 중 표시
        generatingImages.set(outputFilename, generatePromise);

        return await generatePromise;

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
            imageBase64: `data:image/jpeg;base64,${base64}`,
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