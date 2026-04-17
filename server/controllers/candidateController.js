const { Candidate } = require('../models/index');
const { Op } = require('sequelize');

const getAllCandidates = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, min_score, max_score } = req.query;
        const offset = (page - 1) * limit;
        
        let where = {};
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (min_score || max_score) {
            where.high_school_score = {};
            if (min_score) where.high_school_score[Op.gte] = min_score;
            if (max_score) where.high_school_score[Op.lte] = max_score;
        }

        const { count, rows } = await Candidate.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
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

const getCandidateById = async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
        
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCandidate = async (req, res) => {
    try {
        const { name, email, phone, high_school_score } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        const existing = await Candidate.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const candidate = await Candidate.create({ name, email, phone, high_school_score });
        res.status(201).json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

        const { name, email, phone, high_school_score } = req.body;

        if (email && email !== candidate.email) {
            const existing = await Candidate.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        await candidate.update({ name, email, phone, high_school_score });
        res.json(candidate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCandidate = async (req, res) => {
    try {
        const candidate = await Candidate.findByPk(req.params.id);
        if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

        await candidate.destroy();
        res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCandidates,
    getCandidateById,
    createCandidate,
    updateCandidate,
    deleteCandidate
};
