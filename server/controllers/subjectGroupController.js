const { SubjectGroup, Major, MajorSubjectMapping } = require('../models/index');
const { Op } = require('sequelize');

const getAllSubjectGroups = async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;
        
        let where = {};
        if (search) {
            where[Op.or] = [
                { code: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows } = await SubjectGroup.findAndCountAll({
            where,
            include: [{ model: Major }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['code', 'ASC']]
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

const getSubjectGroupById = async (req, res) => {
    try {
        const subjectGroup = await SubjectGroup.findByPk(req.params.id, {
            include: [{ model: Major }]
        });
        
        if (!subjectGroup) return res.status(404).json({ message: 'Không tìm thấy tổ hợp môn' });
        
        res.json(subjectGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSubjectGroup = async (req, res) => {
    try {
        const { code, name, description } = req.body;
        
        if (!code || !name) {
            return res.status(400).json({ message: 'Mã và tên tổ hợp là bắt buộc' });
        }

        const existing = await SubjectGroup.findOne({ where: { code } });
        if (existing) {
            return res.status(400).json({ message: 'Mã tổ hợp môn đã tồn tại' });
        }

        const subjectGroup = await SubjectGroup.create({ code, name, description });
        res.status(201).json(subjectGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSubjectGroup = async (req, res) => {
    try {
        const subjectGroup = await SubjectGroup.findByPk(req.params.id);
        if (!subjectGroup) return res.status(404).json({ message: 'Không tìm thấy tổ hợp môn' });

        const { code, name, description } = req.body;

        if (code && code !== subjectGroup.code) {
            const existing = await SubjectGroup.findOne({ where: { code } });
            if (existing) {
                return res.status(400).json({ message: 'Mã tổ hợp môn đã tồn tại' });
            }
        }

        await subjectGroup.update({ code, name, description });
        res.json(subjectGroup);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteSubjectGroup = async (req, res) => {
    try {
        const subjectGroup = await SubjectGroup.findByPk(req.params.id);
        if (!subjectGroup) return res.status(404).json({ message: 'Subject group not found' });

        const mappingCount = await MajorSubjectMapping.count({ where: { subject_group_id: subjectGroup.id } });
        if (mappingCount > 0) {
            return res.status(400).json({ message: 'Không thể xóa tổ hợp môn đã được gán cho ngành học' });
        }

        await subjectGroup.destroy();
        res.json({ message: 'Xóa tổ hợp môn thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSubjectGroups,
    getSubjectGroupById,
    createSubjectGroup,
    updateSubjectGroup,
    deleteSubjectGroup
};
