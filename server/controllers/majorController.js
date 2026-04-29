const { Major, Faculty, Specialization, SubjectGroup, HistoricalScore, AdmissionMethod, MajorSubjectMapping, TrainingType, MajorTrainingType } = require('../models/index');
const { Op } = require('sequelize');

const getAllMajors = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, faculty_id, min_tuition, max_tuition } = req.query;
        const offset = (page - 1) * limit;
        
        let where = {};
        
        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { code: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (faculty_id) where.faculty_id = faculty_id;
        
        if (min_tuition || max_tuition) {
            where.tuition = {};
            if (min_tuition) where.tuition[Op.gte] = min_tuition;
            if (max_tuition) where.tuition[Op.lte] = max_tuition;
        }

        const { count, rows } = await Major.findAndCountAll({
            where,
            include: [
                { model: Faculty },
                { model: Specialization },
                { model: SubjectGroup },
                { model: HistoricalScore, include: [AdmissionMethod] },
                { model: TrainingType, as: 'TrainingTypes' }
            ],
            distinct: true,
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

const getMajorById = async (req, res) => {
    try {
        const major = await Major.findByPk(req.params.id, {
            include: [
                { model: Faculty },
                { model: Specialization },
                { model: SubjectGroup },
                { model: HistoricalScore, include: [AdmissionMethod], order: [['year', 'DESC']] },
                { model: TrainingType, as: 'TrainingTypes' }
            ]
        });
        
        if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' });
        
        res.json(major);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMajor = async (req, res) => {
    try {
        const { code, name, faculty_id, tuition, quota, description, subject_group_ids, training_type_ids } = req.body;
        
        if (training_type_ids && training_type_ids.length > 0) {
            if (training_type_ids.length > 5) { // Increased limit to 5
                return res.status(400).json({ message: 'Vui lòng chọn tối đa 5 loại hình đào tạo' });
            }
        }
        
        if (!code || !name || !faculty_id) {
            return res.status(400).json({ message: 'Mã ngành, tên ngành và khoa là bắt buộc' });
        }

        const existing = await Major.findOne({ where: { code } });
        if (existing) {
            return res.status(400).json({ message: 'Mã ngành đã tồn tại' });
        }

        const major = await Major.create({
            code,
            name,
            faculty_id,
            tuition,
            quota,
            description
        });

        if (subject_group_ids && Array.isArray(subject_group_ids)) {
            const mappings = subject_group_ids.map(sg_id => ({
                major_id: major.id,
                subject_group_id: sg_id
            }));
            await MajorSubjectMapping.bulkCreate(mappings);
        }

        if (training_type_ids && Array.isArray(training_type_ids)) {
            await major.setTrainingTypes(training_type_ids);
        }


        res.status(201).json(major);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMajor = async (req, res) => {
    try {
        const major = await Major.findByPk(req.params.id);
        if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' });

        const { code, name, faculty_id, tuition, quota, description, subject_group_ids, training_type_ids } = req.body;

        if (training_type_ids && training_type_ids.length > 0) {
            if (training_type_ids.length > 5) { // Increased limit to 5
                return res.status(400).json({ message: 'Vui lòng chọn tối đa 5 loại hình đào tạo' });
            }
        }


        if (code && code !== major.code) {
            const existing = await Major.findOne({ where: { code } });
            if (existing) {
                return res.status(400).json({ message: 'Mã ngành đã tồn tại' });
            }
        }

        await major.update({
            code: code || major.code,
            name: name || major.name,
            faculty_id: faculty_id || major.faculty_id,
            tuition: tuition !== undefined ? tuition : major.tuition,
            quota: quota !== undefined ? quota : major.quota,
            description: description || major.description
        });

        if (subject_group_ids && Array.isArray(subject_group_ids)) {
            await MajorSubjectMapping.destroy({ where: { major_id: major.id } });
            const mappings = subject_group_ids.map(sg_id => ({
                major_id: major.id,
                subject_group_id: sg_id
            }));
            await MajorSubjectMapping.bulkCreate(mappings);
        }

        if (training_type_ids && Array.isArray(training_type_ids)) {
            await major.setTrainingTypes(training_type_ids);
        }


        res.json(major);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMajor = async (req, res) => {
    try {
        const major = await Major.findByPk(req.params.id);
        if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' });

        // Require models
        const db = require('../models/index');

        // Delete associated records to prevent foreign key constraint errors
        await MajorSubjectMapping.destroy({ where: { major_id: major.id } });
        await HistoricalScore.destroy({ where: { major_id: major.id } });
        
        if (db.Specialization) await db.Specialization.destroy({ where: { major_id: major.id } });
        if (db.MajorImage) await db.MajorImage.destroy({ where: { major_id: major.id } });
        if (db.sequelize.models.MajorTrainingType) {
            await db.sequelize.models.MajorTrainingType.destroy({ where: { major_id: major.id } });
        }

        await major.destroy();

        res.json({ message: 'Xóa ngành học thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMajorStatistics = async (req, res) => {
    try {
        const major = await Major.findByPk(req.params.id, {
            include: [
                { model: HistoricalScore }
            ]
        });

        if (!major) return res.status(404).json({ message: 'Không tìm thấy ngành học' });

        res.json({
            major_id: major.id,
            major_name: major.name,
            historical_scores: major.HistoricalScores,
            quota: major.quota
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMajorSummaryStats = async (req, res) => {
    try {
        const [
            totalQuota
        ] = await Promise.all([
            Major.sum('quota')
        ]);

        res.json({
            total_quota: totalQuota || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMajors,
    getMajorById,
    createMajor,
    updateMajor,
    deleteMajor,
    getMajorStatistics,
    getMajorSummaryStats
};
