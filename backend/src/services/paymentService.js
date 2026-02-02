const axios = require('axios');
const { Order, ApiKey } = require('../../models');
const { decrypt } = require('../utils/encryption');  // 이미 있는 유틸 사용!

class PaymentService {
    /**
     * 토스페이먼츠 API 키 조회 (DB에서)
     */
    static async getPaymentKeys() {
        const apiKey = await ApiKey.findOne({
            where: {
                service_name: 'tosspayments',
                is_active: true
            }
        });

        if (!apiKey) {
            throw new Error('토스페이먼츠 API 키를 찾을 수 없습니다.');
        }

        // 복호화
        const decryptedData = decrypt(apiKey.api_key);
        const keys = JSON.parse(decryptedData);

        return {
            clientKey: keys.clientKey,
            secretKey: keys.secretKey,
            webhookKey: keys.webhookKey
        };
    }

    /**
     * 주문 생성 (결제 전)
     */
    static async createOrder(userId, productId, amount) {
        try {
            const orderId = `order_${Date.now()}_${userId}`;

            const order = await Order.create({
                user_id: userId,
                product_id: productId,
                amount,
                order_id: orderId,
                status: 'pending'
            });

            return {
                orderId: order.id,
                orderIdStr: order.order_id
            };
        } catch (error) {
            console.error('주문 생성 오류:', error);
            throw new Error('주문 생성에 실패했습니다.');
        }
    }

    /**
     * 토스페이먼츠 결제 승인
     */
    static async confirmPayment(paymentKey, orderId, amount) {
        try {
            const keys = await this.getPaymentKeys();

            const response = await axios.post(
                'https://api.tosspayments.com/v1/payments/confirm',
                {
                    paymentKey,
                    orderId,
                    amount
                },
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(keys.secretKey + ':').toString('base64')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('토스페이먼츠 승인 오류:', error.response?.data);
            throw new Error(error.response?.data?.message || '결제 승인에 실패했습니다.');
        }
    }

    /**
     * 결제 완료 처리
     */
    static async completePayment(orderId, paymentKey, paymentData) {
        try {
            const [updated] = await Order.update(
                {
                    payment_key: paymentKey,
                    payment_method: paymentData.method,
                    status: 'completed',
                    paid_at: new Date()
                },
                {
                    where: { order_id: orderId }
                }
            );

            if (updated === 0) {
                throw new Error('주문을 찾을 수 없습니다.');
            }

            return true;
        } catch (error) {
            console.error('결제 완료 처리 오류:', error);
            throw error;
        }
    }

    /**
     * 결제 취소
     */
    static async cancelPayment(paymentKey, cancelReason) {
        try {
            const keys = await this.getPaymentKeys();

            const response = await axios.post(
                `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
                { cancelReason },
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(keys.secretKey + ':').toString('base64')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            await Order.update(
                { status: 'cancelled' },
                { where: { payment_key: paymentKey } }
            );

            return response.data;
        } catch (error) {
            console.error('결제 취소 오류:', error.response?.data);
            throw error;
        }
    }
}

module.exports = PaymentService;