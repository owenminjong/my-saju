const PaymentService = require('../services/paymentService');
const { Product, Order } = require('../../models');

// 결제 준비 (주문 생성)
exports.preparePayment = async (req, res) => {
    try {
        const { product_id } = req.body;
        const userId = req.body.user_id;

        const product = await Product.findByPk(product_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없습니다.',
            });
        }

        const paymentAmount = product.discount_price || product.price;
        const keys = await PaymentService.getPaymentKeys();
        const order = await PaymentService.createOrder(userId, product_id, paymentAmount);

        console.log('생성된 주문:', order);  // 디버깅

        res.json({
            success: true,
            data: {
                orderId: order.orderIdStr,  // ✅ 이게 문자열이어야 함!
                productName: product.name,
                amount: paymentAmount,
                clientKey: keys.clientKey,
            },
        });
    } catch (error) {
        console.error('결제 준비 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '결제 준비에 실패했습니다.',
        });
    }
};

// 결제 승인 (토스페이먼츠)
exports.confirmPayment = async (req, res) => {
    try {
        const { paymentKey, orderId, amount } = req.body;

        console.log('결제 승인 요청:', { paymentKey, orderId, amount });

        // DB에서 주문 확인
        const order = await Order.findOne({
            where: { order_id: orderId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.',
            });
        }

        // 금액 검증
        if (order.amount !== amount) {
            console.error('금액 불일치:', { orderAmount: order.amount, requestAmount: amount });
            return res.status(400).json({
                success: false,
                message: '결제 금액이 일치하지 않습니다.',
            });
        }

        // 토스페이먼츠 결제 승인
        const paymentData = await PaymentService.confirmPayment(
            paymentKey,
            orderId,
            amount
        );

        // 결제 완료 처리
        await PaymentService.completePayment(orderId, paymentKey, paymentData);

        res.json({
            success: true,
            message: '결제가 완료되었습니다.',
            data: {
                orderId: order.id,
                amount: paymentData.totalAmount,
            },
        });
    } catch (error) {
        console.error('결제 승인 오류:', error);
        res.status(400).json({
            success: false,
            message: error.message || '결제 승인에 실패했습니다.',
        });
    }
};

// 결제 취소
exports.cancelPayment = async (req, res) => {
    try {
        const { paymentKey, cancelReason } = req.body;

        const cancel = await PaymentService.cancelPayment(paymentKey, cancelReason);

        res.json({
            success: true,
            message: '결제가 취소되었습니다.',
            data: cancel,
        });
    } catch (error) {
        console.error('결제 취소 오류:', error);
        res.status(400).json({
            success: false,
            message: error.message || '결제 취소에 실패했습니다.',
        });
    }
};