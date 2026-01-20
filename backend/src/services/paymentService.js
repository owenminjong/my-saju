const Iamport = require('iamport');
const { pool } = require('../config/database');

// 아임포트 클라이언트 초기화
const iamport = new Iamport({
    impKey: process.env.IAMPORT_API_KEY,
    impSecret: process.env.IAMPORT_API_SECRET,
});

class PaymentService {
    /**
     * 주문 생성 (결제 전)
     */
    static async createOrder(userId, productId, amount) {
        try {
            const connection = await pool.getConnection();

            // 주문번호 생성 (merchant_uid)
            const merchantUid = `order_${Date.now()}_${userId}`;

            const [result] = await connection.query(
                `INSERT INTO orders (user_id, product_id, amount, merchant_uid, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
                [userId, productId, amount, merchantUid]
            );

            connection.release();

            return {
                orderId: result.insertId,
                merchantUid,
            };
        } catch (error) {
            console.error('주문 생성 오류:', error);
            throw new Error('주문 생성에 실패했습니다.');
        }
    }

    /**
     * 결제 검증 (아임포트)
     */
    static async verifyPayment(impUid, merchantUid, amount) {
        try {
            // 아임포트에서 결제 정보 조회
            const payment = await iamport.payment.getByImpUid({ imp_uid: impUid });

            // 검증 1: 결제 금액 일치
            if (payment.amount !== amount) {
                throw new Error('결제 금액이 일치하지 않습니다.');
            }

            // 검증 2: 주문번호 일치
            if (payment.merchant_uid !== merchantUid) {
                throw new Error('주문번호가 일치하지 않습니다.');
            }

            // 검증 3: 결제 상태
            if (payment.status !== 'paid') {
                throw new Error('결제가 완료되지 않았습니다.');
            }

            return payment;
        } catch (error) {
            console.error('결제 검증 오류:', error);
            throw error;
        }
    }

    /**
     * 결제 완료 처리
     */
    static async completePayment(merchantUid, impUid, paymentMethod) {
        try {
            const connection = await pool.getConnection();

            const [result] = await connection.query(
                `UPDATE orders 
         SET imp_uid = ?, 
             payment_method = ?, 
             status = 'completed', 
             paid_at = NOW() 
         WHERE merchant_uid = ?`,
                [impUid, paymentMethod, merchantUid]
            );

            connection.release();

            if (result.affectedRows === 0) {
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
    static async cancelPayment(impUid, reason) {
        try {
            const cancel = await iamport.payment.cancelByImpUid({
                imp_uid: impUid,
                reason,
            });

            const connection = await pool.getConnection();

            await connection.query(
                `UPDATE orders 
         SET status = 'cancelled' 
         WHERE imp_uid = ?`,
                [impUid]
            );

            connection.release();

            return cancel;
        } catch (error) {
            console.error('결제 취소 오류:', error);
            throw error;
        }
    }
}

module.exports = PaymentService;