const { User, Major, ChatSession, ChatMessage, sequelize } = require('../models');
const { Op } = require('sequelize');
const { generateDashboardPDF } = require('../utils/dashboardPdfGenerator');

const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalMajors,
            totalChatSessions
        ] = await Promise.all([
            User.count(),
            Major.count(),
            ChatSession.count()
        ]);

        res.json({
            counts: {
                users: totalUsers,
                majors: totalMajors,
                chat_sessions: totalChatSessions
            },
            system_health: {
                gemini_status: 'connected',
                database_status: 'healthy',
                uptime: process.uptime()
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChatbotStatistics = async (req, res) => {
    try {
        // 1. Mức độ sử dụng (7 ngày gần nhất)
        const usageStats = await ChatSession.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                createdAt: { [Op.gte]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 7 DAY)') }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        // 2. Trường THPT quan tâm (Top 10)
        const schoolStats = await ChatSession.findAll({
            attributes: [
                'visitor_school',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                visitor_school: { [Op.ne]: null }
            },
            group: ['visitor_school'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        });

        // 3. Ngành học được quan tâm (Dựa tên metadata/major_card)
        // Lưu ý: Query JSON trong MySQL/MariaDB dùng ->>
        const majorInterests = await ChatMessage.findAll({
            attributes: [
                [sequelize.literal("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.data.name'))"), 'major_name'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                role: 'assistant',
                metadata: { [Op.ne]: null }
            },
            group: [sequelize.literal("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.data.name'))")],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        });

        // 4. Câu hỏi phổ biến (Top 10 câu hỏi từ user)
        const topQuestions = await ChatMessage.findAll({
            attributes: [
                'content',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { role: 'user' },
            group: ['content'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        });
        
        // 5. Tin nhắn gần nhất (Chi tiết 20 tin nhắn mới nhất từ người dùng)
        const recentMessages = await ChatMessage.findAll({
            where: { role: 'user' },
            limit: 20,
            order: [['createdAt', 'DESC']],
            include: [{
                model: ChatSession,
                include: [{
                    model: User,
                    attributes: ['id', 'email']
                }]
            }]
        });

        res.json({
            usage: usageStats,
            schools: schoolStats,
            majors: majorInterests.filter(m => m.getDataValue('major_name')), // Lọc các kết quả không phải major card
            questions: topQuestions,
            recent_messages: recentMessages
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMajorStats = async (req, res) => {
    try {
        const stats = await Major.findAll({
            attributes: [
                'id', 'name', 'code', 'quota', 'tuition',
                [sequelize.fn('COUNT', sequelize.col('Specializations.id')), 'specialization_count']
            ],
            include: [{
                model: sequelize.model('Specialization'),
                as: 'Specializations',
                attributes: []
            }],
            group: ['Major.id'],
            order: [['quota', 'DESC']]
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportDashboardPDF = async (req, res) => {
    try {
        // 1. Get counts
        const [totalUsers, totalMajors, totalChatSessions] = await Promise.all([
            User.count(),
            Major.count(),
            ChatSession.count()
        ]);

        // 2. Schools stats
        const schoolStats = await ChatSession.findAll({
            attributes: ['visitor_school', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: { visitor_school: { [Op.ne]: null } },
            group: ['visitor_school'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        });

        // 3. Major interests
        const majorInterests = await ChatMessage.findAll({
            attributes: [
                [sequelize.literal("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.data.name'))"), 'major_name'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { role: 'assistant', metadata: { [Op.ne]: null } },
            group: [sequelize.literal("JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.data.name'))")],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        });

        // 4. Top Questions
        const topQuestions = await ChatMessage.findAll({
            attributes: ['content', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: { role: 'user' },
            group: ['content'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
            limit: 10
        });

        const data = {
            counts: { users: totalUsers, majors: totalMajors, chat_sessions: totalChatSessions },
            schools: schoolStats,
            majors: majorInterests.filter(m => m.getDataValue('major_name')),
            questions: topQuestions
        };

        const pdfBuffer = await generateDashboardPDF(data);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Bao_cao_TVTS_${new Date().toISOString().split('T')[0]}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getChatbotStatistics,
    getMajorStats,
    exportDashboardPDF
};
