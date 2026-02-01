const PaymentService = require('../services/paymentService');
const { Product, Order } = require('../../models');

// 결제 준비 (주문 생성)
exports.preparePayment = async (req, res) => {
    try {
        const { product_id } = req.body;
        const userId = req.body.user_id; // 나중에 JWT에서 추출

        // 상품 정보 조회
        const product = await Product.findByPk(product_id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없습니다.',
            });
        }

        // 주문 생성
        const order = await PaymentService.createOrder(
            userId,
            product_id,
            product.price
        );

        res.json({
            success: true,
            data: {
                orderId: order.orderId,
                merchantUid: order.merchantUid,
                productName: product.name,
                amount: product.price,
                impCode: process.env.IAMPORT_IMP_CODE,
            },
        });
    } catch (error) {
        console.error('결제 준비 오류:', error);
        res.status(500).json({
            success: false,
            message: '결제 준비에 실패했습니다.',
        });
    }
};

// 결제 검증 및 완료
exports.verifyPayment = async (req, res) => {
    try {
        const { imp_uid, merchant_uid } = req.body;

        // DB에서 주문 정보 조회
        const order = await Order.findOne({
            where: { merchant_uid }
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '주문을 찾을 수 없습니다.',
            });
        }

        // 아임포트 결제 검증
        const payment = await PaymentService.verifyPayment(
            imp_uid,
            merchant_uid,
            order.amount
        );

        // 결제 완료 처리
        await PaymentService.completePayment(
            merchant_uid,
            imp_uid,
            payment.pay_method
        );

        res.json({
            success: true,
            message: '결제가 완료되었습니다.',
            data: {
                orderId: order.id,
                amount: payment.amount,
            },
        });
    } catch (error) {
        console.error('결제 검증 오류:', error);
        res.status(400).json({
            success: false,
            message: error.message || '결제 검증에 실패했습니다.',
        });
    }
};

// 결제 취소
exports.cancelPayment = async (req, res) => {
    try {
        const { imp_uid, reason } = req.body;

        const cancel = await PaymentService.cancelPayment(imp_uid, reason);

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