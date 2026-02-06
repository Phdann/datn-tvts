const { ChatSession, ChatMessage } = require('../models/index');
const geminiService = require('../services/geminiService');

const sendMessage = async (req, res) => {
    try {
        const { message, sessionId, context } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const persona = context?.persona || 'student';

        let session;
        if (sessionId) {
            session = await ChatSession.findByPk(sessionId);
        }
        
        if (!session) {
            session = await ChatSession.create({
                user_id: req.user?.id || null
            });
        }

        await ChatMessage.create({
            session_id: session.id,
            role: 'user',
            content: message
        });

        const history = await ChatMessage.findAll({
            where: { session_id: session.id },
            order: [['createdAt', 'ASC']],
            limit: 10,
            attributes: ['role', 'content']
        });

        const aiResponse = await geminiService.generateResponse(
            message,
            persona,
            history.map(h => ({ role: h.role, content: h.content }))
        );

        await ChatMessage.create({
            session_id: session.id,
            role: 'assistant',
            content: aiResponse.reply
        });

        const response = {
            sessionId: session.id,
            reply: aiResponse.reply
        };

        if (aiResponse.related_data?.type === 'major_card') {
            response.majorCard = aiResponse.related_data.data;
        }

        if (aiResponse.related_data?.type === 'chart') {
            response.chart = aiResponse.related_data.data;
        }

        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ 
            message: 'Đã xảy ra lỗi khi xử lý tin nhắn',
            error: error.message 
        });
    }
};

const getAllChatSessions = async (req, res) => {
    try {
        const { page = 1, limit = 20, user_id } = req.query;
        const offset = (page - 1) * limit;
        
        let where = {};
        if (user_id) where.user_id = user_id;

        const { count, rows } = await ChatSession.findAndCountAll({
            where,
            include: [{ model: ChatMessage, limit: 1, order: [['createdAt', 'DESC']] }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['updatedAt', 'DESC']]
        });

        res.json({
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            data: rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChatSessionById = async (req, res) => {
    try {
        const session = await ChatSession.findByPk(req.params.id, {
            include: [{ model: ChatMessage, order: [['createdAt', 'ASC']] }]
        });
        
        if (!session) return res.status(404).json({ message: 'Chat session not found' });
        
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const messages = await ChatMessage.findAll({
            where: { session_id: req.params.sessionId },
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteChatSession = async (req, res) => {
    try {
        const session = await ChatSession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: 'Chat session not found' });

        await ChatMessage.destroy({ where: { session_id: session.id } });
        await session.destroy();

        res.json({ message: 'Chat session deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cleanupOldSessions = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        const oldSessions = await ChatSession.findAll({
            where: {
                updatedAt: { [Op.lt]: cutoffDate }
            }
        });

        const sessionIds = oldSessions.map(s => s.id);
        
        await ChatMessage.destroy({ where: { session_id: sessionIds } });
        
        const deletedCount = await ChatSession.destroy({
            where: { id: sessionIds }
        });

        res.json({ 
            message: `Cleaned up ${deletedCount} old chat sessions`,
            deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getChatStatistics = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        
        const totalSessions = await ChatSession.count();
        const totalMessages = await ChatMessage.count();
        const activeSessions = await ChatSession.count({
            where: {
                updatedAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        });

        res.json({
            total_sessions: totalSessions,
            total_messages: totalMessages,
            active_sessions_24h: activeSessions,
            avg_messages_per_session: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    getAllChatSessions,
    getChatSessionById,
    getChatHistory,
    deleteChatSession,
    cleanupOldSessions,
    getChatStatistics
};
