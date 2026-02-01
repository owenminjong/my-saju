const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User, ApiKey } = require('../../models');
const { decrypt } = require('../utils/encryption');
const qs = require('qs');

class AuthController {
    /**
     * 카카오 로그인 시작
     */
    kakaoLogin = async (req, res) => {
        try {
            const apiKey = await this.getKakaoApiKey();

            const REDIRECT_URI = process.env.KAKAO_REDIRECT_URI || 'http://localhost:5000/api/auth/kakao/callback';
            const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${apiKey}&redirect_uri=${REDIRECT_URI}&response_type=code`;

            res.redirect(KAKAO_AUTH_URL);
        } catch (error) {
            console.error('카카오 로그인 시작 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * 카카오 콜백
     */
    kakaoCallback = async (req, res) => {
        const { code } = req.query;

        try {
            const apiKey = await this.getKakaoApiKey();
            const REDIRECT_URI = 'http://localhost:5000/api/auth/kakao/callback';

            console.log('🔑 API Key:', apiKey);
            console.log('🔗 Redirect URI:', REDIRECT_URI);
            console.log('🎫 Code:', code);

            const params = {
                grant_type: 'authorization_code',
                client_id: apiKey,
                redirect_uri: REDIRECT_URI,
                code: code
            };

            console.log('📤 요청 파라미터:', params);

            const tokenResponse = await axios.post(
                'https://kauth.kakao.com/oauth/token',
                qs.stringify(params),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const accessToken = tokenResponse.data.access_token;

            // 3. 사용자 정보 받기
            const userResponse = await axios.get(
                'https://kapi.kakao.com/v2/user/me',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            const kakaoUser = userResponse.data;

            // 4. DB에 사용자 저장 또는 업데이트
            const user = await this.saveOrUpdateUser({
                provider: 'kakao',
                providerId: String(kakaoUser.id),
                email: kakaoUser.kakao_account?.email || null,
                name: kakaoUser.properties?.nickname || '카카오 사용자'
            });

            // 5. JWT 토큰 발급
            const jwtSecret = process.env.JWT_SECRET || 'mylifecode-secret-key-2026';
            const jwtToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    name: user.name
                },
                jwtSecret,
                { expiresIn: '7d' }
            );

            // 6. 프론트엔드로 리다이렉트
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/auth/success?token=${jwtToken}`);

        } catch (error) {
            console.error('카카오 콜백 오류:', error.response?.data || error.message);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/auth/fail?error=${encodeURIComponent(error.message)}`);
        }
    }

    /**
     * DB에서 카카오 API 키 가져오기
     */
    getKakaoApiKey = async () => {
        try {
            console.log('🔍 카카오 API 키 조회 시작...');

            const apiKey = await ApiKey.findOne({
                where: {
                    service_name: 'kakao',
                    category: 'social',
                    is_active: true
                }
            });

            console.log('📊 쿼리 결과:', apiKey);

            if (!apiKey) {
                throw new Error('카카오 API 키가 설정되지 않았습니다.');
            }

            // 복호화
            const decryptedKey = decrypt(apiKey.api_key);

            console.log('✅ 복호화된 키:', decryptedKey.substring(0, 10) + '...');

            return decryptedKey;
        } catch (error) {
            console.error('💥 카카오 API 키 조회 오류:', error);
            throw new Error('카카오 API 키 조회 실패: ' + error.message);
        }
    }

    /**
     * 네이버 자격증명 가져오기
     */
    getNaverCredentials = async () => {
        try {
            const apiKey = await ApiKey.findOne({
                where: {
                    service_name: 'naver',
                    category: 'social',
                    is_active: true
                }
            });

            if (!apiKey) {
                throw new Error('네이버 API 키가 설정되지 않았습니다.');
            }

            const decrypted = decrypt(apiKey.api_key);
            const credentials = JSON.parse(decrypted);

            return {
                clientId: credentials.client_id,
                clientSecret: credentials.client_secret
            };
        } catch (error) {
            console.error('네이버 API 키 조회 오류:', error);
            throw new Error('네이버 API 키 조회 실패: ' + error.message);
        }
    }

    /**
     * 네이버 로그인 시작
     */
    naverLogin = async (req, res) => {
        try {
            const { clientId } = await this.getNaverCredentials();
            const REDIRECT_URI = process.env.NAVER_REDIRECT_URI || 'http://localhost:5000/api/auth/naver/callback';
            const STATE = Math.random().toString(36).substring(7);

            const NAVER_AUTH_URL = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${STATE}`;

            res.redirect(NAVER_AUTH_URL);
        } catch (error) {
            console.error('네이버 로그인 시작 오류:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * 네이버 콜백
     */
    naverCallback = async (req, res) => {
        const { code, state } = req.query;

        if (!code) {
            return res.redirect('http://localhost:3000/auth/fail?error=no_code');
        }

        try {
            const { clientId, clientSecret } = await this.getNaverCredentials();
            const REDIRECT_URI = 'http://localhost:5000/api/auth/naver/callback';

            // 1. 액세스 토큰 받기
            const tokenResponse = await axios.post(
                'https://nid.naver.com/oauth2.0/token',
                qs.stringify({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    client_secret: clientSecret,
                    code: code,
                    state: state
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const accessToken = tokenResponse.data.access_token;

            // 2. 사용자 정보 받기
            const userResponse = await axios.get(
                'https://openapi.naver.com/v1/nid/me',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );

            const naverUser = userResponse.data.response;

            // 3. DB에 사용자 저장 또는 업데이트
            const user = await this.saveOrUpdateUser({
                provider: 'naver',
                providerId: String(naverUser.id),
                email: naverUser.email || null,
                name: naverUser.name || naverUser.nickname || '네이버 사용자'
            });

            // 4. JWT 토큰 발급
            const jwtSecret = process.env.JWT_SECRET || 'mylifecode-secret-key-2026';
            const jwtToken = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    name: user.name
                },
                jwtSecret,
                { expiresIn: '7d' }
            );

            // 5. 프론트엔드로 리다이렉트
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/auth/success?token=${jwtToken}`);

        } catch (error) {
            console.error('네이버 콜백 오류:', error.response?.data || error.message);
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            res.redirect(`${frontendUrl}/auth/fail?error=${encodeURIComponent(error.message)}`);
        }
    }

    /**
     * 사용자 저장 또는 업데이트
     */
    saveOrUpdateUser = async (userData) => {
        const { provider, providerId, email, name } = userData;

        try {
            // 기존 사용자 확인
            const existingUser = await User.findOne({
                where: {
                    provider,
                    provider_id: providerId
                }
            });

            if (existingUser) {
                // 기존 사용자 업데이트
                await existingUser.update({
                    name,
                    email,
                    last_login_at: new Date()
                });

                return {
                    id: existingUser.id,
                    email: email || existingUser.email,
                    name
                };
            } else {
                // 새 사용자 생성
                const newUser = await User.create({
                    provider,
                    provider_id: providerId,
                    email,
                    name,
                    last_login_at: new Date()
                });

                return {
                    id: newUser.id,
                    email,
                    name
                };
            }
        } catch (error) {
            console.error('사용자 저장 오류:', error);
            throw new Error('사용자 정보 저장 실패');
        }
    }

    /**
     * 활성화된 소셜 로그인 목록 조회
     */
    getActiveSocialLogins = async (req, res) => {
        try {
            const apiKeys = await ApiKey.findAll({
                where: {
                    category: 'social',
                    is_active: true
                },
                attributes: ['service_name']
            });

            const activeLogins = apiKeys.map(key => key.service_name);

            res.json({
                success: true,
                data: activeLogins
            });
        } catch (error) {
            console.error('소셜 로그인 목록 조회 오류:', error);
            res.status(500).json({
                success: false,
                message: '소셜 로그인 목록 조회 실패'
            });
        }
    }
}

module.exports = new AuthController();