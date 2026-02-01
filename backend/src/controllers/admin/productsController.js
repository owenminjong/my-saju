const { Product } = require('../../../models');

// 상품 목록 조회
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('상품 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '상품 목록 조회에 실패했습니다.'
        });
    }
};

// 상품 상세 조회
exports.getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('상품 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '상품 상세 조회에 실패했습니다.'
        });
    }
};

// 상품 생성
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            discount_rate = 0,
            promotion_active = false,
            is_active = true
        } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: '상품명과 가격은 필수입니다.'
            });
        }

        // 할인가 계산
        const discountPrice = discount_rate > 0
            ? Math.floor(price * (1 - discount_rate / 100))
            : null;

        const product = await Product.create({
            name,
            description,
            price,
            discount_rate,
            discount_price: discountPrice,
            promotion_active,
            is_active
        });

        res.status(201).json({
            success: true,
            message: '상품이 생성되었습니다.',
            data: { id: product.id }
        });

    } catch (error) {
        console.error('상품 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '상품 생성에 실패했습니다.'
        });
    }
};

// 상품 수정
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            discount_rate,
            promotion_active,
            is_active
        } = req.body;

        // 수정할 데이터만 포함
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (discount_rate !== undefined) updateData.discount_rate = discount_rate;
        if (promotion_active !== undefined) updateData.promotion_active = promotion_active;
        if (is_active !== undefined) updateData.is_active = is_active;

        // 할인가 재계산 (가격 또는 할인율이 변경된 경우)
        if (price !== undefined || discount_rate !== undefined) {
            const currentProduct = await Product.findByPk(id);
            if (!currentProduct) {
                return res.status(404).json({
                    success: false,
                    message: '상품을 찾을 수 없습니다.'
                });
            }

            const finalPrice = price !== undefined ? price : currentProduct.price;
            const finalDiscountRate = discount_rate !== undefined ? discount_rate : currentProduct.discount_rate;

            updateData.discount_price = finalDiscountRate > 0
                ? Math.floor(finalPrice * (1 - finalDiscountRate / 100))
                : null;
        }

        const [updated] = await Product.update(updateData, {
            where: { id }
        });

        if (updated === 0) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '상품이 수정되었습니다.'
        });

    } catch (error) {
        console.error('상품 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '상품 수정에 실패했습니다.'
        });
    }
};

// 상품 삭제
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Product.destroy({
            where: { id }
        });

        if (deleted === 0) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '상품이 삭제되었습니다.'
        });

    } catch (error) {
        console.error('상품 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '상품 삭제에 실패했습니다.'
        });
    }
};