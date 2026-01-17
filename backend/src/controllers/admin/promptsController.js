const { pool } = require('../../config/database');

// 프롬프트 목록 조회
exports.getPrompts = async (req, res) => {
    try {
        const { category = '' } = req.query;
        const connection = await pool.getConnection();

        let whereClause = 'WHERE 1=1';
        const params = [];

        if (category) {
            whereClause += ' AND category = ?';
            params.push(category);
        }

        const [prompts] = await connection.query(
            `SELECT * FROM prompts ${whereClause} ORDER BY created_at DESC`,
            params
        );

        connection.release();

        res.json({
            success: true,
            data: prompts
        });

    } catch (error) {
        console.error('프롬프트 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '프롬프트 목록 조회에 실패했습니다.'
        });
    }
};

// 프롬프트 상세 조회
exports.getPromptDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [prompts] = await connection.query(
            'SELECT * FROM prompts WHERE id = ?',
            [id]
        );

        connection.release();

        if (prompts.length === 0) {
            return res.status(404).json({
                success: false,
                message: '프롬프트를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: prompts[0]
        });

    } catch (error) {
        console.error('프롬프트 상세 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '프롬프트 상세 조회에 실패했습니다.'
        });
    }
};

// 프롬프트 생성
exports.createPrompt = async (req, res) => {
    try {
        const { name, content, category, is_active = true } = req.body;

        if (!name || !content) {
            return res.status(400).json({
                success: false,
                message: '이름과 내용은 필수입니다.'
            });
        }

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'INSERT INTO prompts (name, content, category, is_active) VALUES (?, ?, ?, ?)',
            [name, content, category, is_active]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: '프롬프트가 생성되었습니다.',
            data: { id: result.insertId }
        });

    } catch (error) {
        console.error('프롬프트 생성 오류:', error);
        res.status(500).json({
            success: false,
            message: '프롬프트 생성에 실패했습니다.'
        });
    }
};

// 프롬프트 수정
exports.updatePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content, category, is_active } = req.body;

        const connection = await pool.getConnection();

        const [result] = await connection.query(
            `UPDATE prompts 
       SET name = COALESCE(?, name),
           content = COALESCE(?, content),
           category = COALESCE(?, category),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
            [name, content, category, is_active, id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '프롬프트를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '프롬프트가 수정되었습니다.'
        });

    } catch (error) {
        console.error('프롬프트 수정 오류:', error);
        res.status(500).json({
            success: false,
            message: '프롬프트 수정에 실패했습니다.'
        });
    }
};

// 프롬프트 삭제
exports.deletePrompt = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [result] = await connection.query(
            'DELETE FROM prompts WHERE id = ?',
            [id]
        );

        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: '프롬프트를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            message: '프롬프트가 삭제되었습니다.'
        });

    } catch (error) {
        console.error('프롬프트 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '프롬프트 삭제에 실패했습니다.'
        });
    }
};