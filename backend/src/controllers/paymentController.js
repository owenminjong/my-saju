const PaymentService = require('../services/paymentService');
const { Product, Order } = require('../../models');
const jwt = require('jsonwebtoken');
// 결제 준비 (주문 생성)
exports.preparePayment = async (req, res) => {
    try {
        const { product_id } = req.body;

        // ✅ JWT 토큰에서 userId 추출
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '로그인이 필요합니다.'
            });
        }

        const jwtSecret = process.env.JWT_SECRET || 'mylifecode-secret-key-2026';
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.userId;  // ✅ authController에서 userId로 저장했음

        console.log('현재 로그인 유저:', userId);

        const product = await Product.findByPk(product_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없습니다.',
            });
        }

        const paymentAmount = (product.promotion_active === 1 && product.discount_price)
            ? product.discount_price
            : product.price;

        console.log('결제 금액 결정:', {
            promotion_active: product.promotion_active,
            discount_price: product.discount_price,
            price: product.price,
            finalAmount: paymentAmount
        });

        const keys = await PaymentService.getPaymentKeys();
        const order = await PaymentService.createOrder(userId, product_id, paymentAmount);

        console.log('생성된 주문:', order);

        res.json({
            success: true,
            data: {
                orderId: order.orderIdStr,
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
        const { paymentKey, orderId } = req.body;

        console.log('결제 승인 요청:', { paymentKey, orderId });

        const order = await Order.findOne({
            where: { order_id: orderId }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.',
            });
        }

        // ✅ DB에 저장된 금액 사용 (URL 파라미터 무시)
        const actualAmount = order.amount;

        console.log('DB 저장 금액으로 승인:', actualAmount);

        // 토스페이먼츠 결제 승인
        const paymentData = await PaymentService.confirmPayment(
            paymentKey,
            orderId,
            actualAmount
        );

        // 결제 완료 처리
        await PaymentService.completePayment(orderId, paymentKey, paymentData);

        res.json({
            success: true,
            message: '결제가 완료되었습니다.',
            data: {
                orderId: order.id,
                orderIdStr: order.order_id,
                amount: actualAmount,
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