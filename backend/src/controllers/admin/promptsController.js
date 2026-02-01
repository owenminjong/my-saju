const { Prompt } = require('../../../models');

// 프롬프트 목록 조회
exports.getPrompts = async (req, res) => {
    try {
        const { category = '' } = req.query;

        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }

        const prompts = await Prompt.findAll({
            where: whereClause,
            order: [['created_at', 'DESC']]
        });

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

        const prompt = await Prompt.findByPk(id);

        if (!prompt) {
            return res.status(404).json({
                success: false,
                message: '프롬프트를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            data: prompt
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

        const prompt = await Prompt.create({
            name,
            content,
            category,
            is_active
        });

        res.status(201).json({
            success: true,
            message: '프롬프트가 생성되었습니다.',
            data: { id: prompt.id }
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

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (content !== undefined) updateData.content = content;
        if (category !== undefined) updateData.category = category;
        if (is_active !== undefined) updateData.is_active = is_active;

        const [updated] = await Prompt.update(updateData, {
            where: { id }
        });

        if (updated === 0) {
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

        const deleted = await Prompt.destroy({
            where: { id }
        });

        if (deleted === 0) {
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