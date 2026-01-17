const { pool } = require('../../config/database');

// 상품 목록 조회
exports.getProducts = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [products] = await connection.query(
            'SELECT * FROM products ORDER BY created_at DESC'
        );

        connection.release();

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
        const connection = await pool.getConnection();

        const [products] = await connection.query(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        connection.release();

        if (products.length === 0) {
            return res.status(404).json({
                success: false,
                message: '상품을 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: products[0]
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
        const { name, description, price, is_active = true } = req.body;

        if (!name || price === undefined) {
            return res.status(400).json({
                success: false,
                message: '상품명과 가격은 필수입니다.'
            });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'INSERT INTO products (name, description, price, is_active) VALUES (?, ?, ?, ?)',
            [name, description, price, is_active]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: '상품이 생성되었습니다.',
            data: { id: result.insertId }
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
        const { name, description, price, is_active } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE products 
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
            [name, description, price, is_active, id]
        );

        connection.release();

        if (result.affectedRows === 0) {
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
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'DELETE FROM products WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
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