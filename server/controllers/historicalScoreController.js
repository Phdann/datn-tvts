const { HistoricalScore, Major, AdmissionMethod } = require('../models/index');
const { Op } = require('sequelize');

const getAllHistoricalScores = async (req, res) => {
    try {
        const { page = 1, limit = 20, major_id, method_id, year } = req.query;
        const offset = (page - 1) * limit;
        
        let where = {};
        if (major_id) where.major_id = major_id;
        if (method_id) where.method_id = method_id;
        if (year) where.year = year;

        const { count, rows } = await HistoricalScore.findAndCountAll({
            where,
            include: [
                { model: Major },
                { model: AdmissionMethod }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['year', 'DESC'], ['score', 'DESC']]
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

const getHistoricalScoreById = async (req, res) => {
    try {
        const score = await HistoricalScore.findByPk(req.params.id, {
            include: [
                { model: Major },
                { model: AdmissionMethod }
            ]
        });
        
        if (!score) return res.status(404).json({ message: 'Historical score not found' });
        
        res.json(score);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createHistoricalScore = async (req, res) => {
    try {
        const { major_id, method_id, year, score } = req.body;
        
        if (!major_id || !method_id || !year || !score) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existing = await HistoricalScore.findOne({
            where: { major_id, method_id, year }
        });
        
        if (existing) {
            return res.status(400).json({ message: 'Historical score for this major, method, and year already exists' });
        }

        const historicalScore = await HistoricalScore.create({ major_id, method_id, year, score });
        res.status(201).json(historicalScore);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateHistoricalScore = async (req, res) => {
    try {
        const historicalScore = await HistoricalScore.findByPk(req.params.id);
        if (!historicalScore) return res.status(404).json({ message: 'Historical score not found' });

        const { major_id, method_id, year, score } = req.body;

        if (major_id || method_id || year) {
            const existing = await HistoricalScore.findOne({
                where: {
                    major_id: major_id || historicalScore.major_id,
                    method_id: method_id || historicalScore.method_id,
                    year: year || historicalScore.year,
                    id: { [Op.ne]: historicalScore.id }
                }
            });
            
            if (existing) {
                return res.status(400).json({ message: 'Historical score for this combination already exists' });
            }
        }

        await historicalScore.update({ major_id, method_id, year, score });
        res.json(historicalScore);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteHistoricalScore = async (req, res) => {
    try {
        const historicalScore = await HistoricalScore.findByPk(req.params.id);
        if (!historicalScore) return res.status(404).json({ message: 'Historical score not found' });

        await historicalScore.destroy();
        res.json({ message: 'Historical score deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const calculateThreshold = async (req, res) => {
    try {
        const { major_id } = req.params;
        const { method_id, years = 3 } = req.query;

        let where = { major_id };
        if (method_id) where.method_id = method_id;

        const scores = await HistoricalScore.findAll({
            where,
            include: [{ model: AdmissionMethod }],
            order: [['year', 'DESC']],
            limit: parseInt(years)
        });

        if (scores.length === 0) {
            return res.status(404).json({ message: 'No historical scores found for this major' });
        }

        const avgScore = scores.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores.length;
        const minScore = Math.min(...scores.map(s => parseFloat(s.score)));
        const maxScore = Math.max(...scores.map(s => parseFloat(s.score)));

        res.json({
            major_id,
            average_score: avgScore.toFixed(2),
            min_score: minScore,
            max_score: maxScore,
            years_analyzed: scores.length,
            scores: scores.map(s => ({
                year: s.year,
                score: s.score,
                method: s.AdmissionMethod?.name
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const predictAdmission = async (req, res) => {
    try {
        const { major_id, user_score, method_id } = req.body;

        if (!major_id || !user_score) {
            return res.status(400).json({ message: 'Major ID and user score are required' });
        }

        let where = { major_id };
        if (method_id) where.method_id = method_id;

        const scores = await HistoricalScore.findAll({
            where,
            order: [['year', 'DESC']],
            limit: 3
        });

        if (scores.length === 0) {
            return res.status(404).json({ message: 'No historical data available for this major' });
        }

        const avgScore = scores.reduce((sum, s) => sum + parseFloat(s.score), 0) / scores.length;
        const difference = parseFloat(user_score) - avgScore;

        let prediction, recommendation;
        if (difference > 2) {
            prediction = 'Safe';
            recommendation = 'Điểm của bạn cao hơn điểm chuẩn trung bình. Khả năng đỗ rất cao!';
        } else if (difference >= 0) {
            prediction = 'Moderate';
            recommendation = 'Điểm của bạn ngang ngửa điểm chuẩn. Bạn có cơ hội đỗ tốt, nhưng nên chuẩn bị thêm nguyện vọng dự phòng.';
        } else {
            prediction = 'Risky';
            recommendation = 'Điểm của bạn thấp hơn điểm chuẩn trung bình. Hãy cân nhắc các nguyện vọng khác hoặc nâng cao điểm số.';
        }

        res.json({
            user_score: parseFloat(user_score),
            average_threshold: avgScore.toFixed(2),
            difference: difference.toFixed(2),
            prediction,
            recommendation,
            historical_scores: scores.map(s => ({ year: s.year, score: s.score }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllHistoricalScores,
    getHistoricalScoreById,
    createHistoricalScore,
    updateHistoricalScore,
    deleteHistoricalScore,
    calculateThreshold,
    predictAdmission
};
