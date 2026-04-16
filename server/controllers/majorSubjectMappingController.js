const { MajorSubjectMapping, Major, SubjectGroup } = require('../models/index');
const { Sequelize } = require('sequelize');

const getAllMappings = async (req, res) => {
    try {
        const { major_id, subject_group_id, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (major_id) where.major_id = major_id;
        if (subject_group_id) where.subject_group_id = subject_group_id;

        const { count, rows } = await MajorSubjectMapping.findAndCountAll({
            where,
            include: [
                { 
                    model: Major, 
                    attributes: ['id', 'name', 'code'] 
                },
                { 
                    model: SubjectGroup, 
                    attributes: ['id', 'name', 'code'] 
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            mappings: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMappingById = async (req, res) => {
    try {
        const { major_id, subject_group_id } = req.params;

        const mapping = await MajorSubjectMapping.findOne({
            where: { major_id, subject_group_id },
            include: [
                { model: Major, attributes: ['id', 'name', 'code'] },
                { model: SubjectGroup, attributes: ['id', 'name', 'code'] }
            ]
        });
        
        if (!mapping) {
            return res.status(404).json({ message: 'Mapping not found' });
        }
        
        res.json(mapping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSubjectGroupsByMajor = async (req, res) => {
    try {
        const { major_id } = req.params;

        const major = await Major.findByPk(major_id);
        if (!major) {
            return res.status(404).json({ message: 'Major not found' });
        }

        const mappings = await MajorSubjectMapping.findAll({
            where: { major_id },
            include: [{ 
                model: SubjectGroup, 
                attributes: ['id', 'name', 'code', 'subjects'] 
            }]
        });

        res.json({
            major: {
                id: major.id,
                name: major.name,
                code: major.code
            },
            subject_groups: mappings.map(m => m.SubjectGroup)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMajorsBySubjectGroup = async (req, res) => {
    try {
        const { subject_group_id } = req.params;

        const subjectGroup = await SubjectGroup.findByPk(subject_group_id);
        if (!subjectGroup) {
            return res.status(404).json({ message: 'Subject group not found' });
        }

        const mappings = await MajorSubjectMapping.findAll({
            where: { subject_group_id },
            include: [{ 
                model: Major, 
                attributes: ['id', 'name', 'code', 'faculty_id'] 
            }]
        });

        res.json({
            subject_group: {
                id: subjectGroup.id,
                name: subjectGroup.name,
                code: subjectGroup.code
            },
            majors: mappings.map(m => m.Major)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMapping = async (req, res) => {
    try {
        const { major_id, subject_group_id } = req.body;
        
        if (!major_id || !subject_group_id) {
            return res.status(400).json({ 
                message: 'major_id and subject_group_id are required' 
            });
        }

        const major = await Major.findByPk(major_id);
        if (!major) {
            return res.status(404).json({ message: 'Major not found' });
        }

        const subjectGroup = await SubjectGroup.findByPk(subject_group_id);
        if (!subjectGroup) {
            return res.status(404).json({ message: 'Subject group not found' });
        }

        const existingMapping = await MajorSubjectMapping.findOne({
            where: { major_id, subject_group_id }
        });

        if (existingMapping) {
            return res.status(400).json({ 
                message: 'Mapping already exists' 
            });
        }

        const mapping = await MajorSubjectMapping.create({
            major_id,
            subject_group_id
        });

        res.status(201).json(mapping);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMapping = async (req, res) => {
    try {
        const { major_id, subject_group_id } = req.params;

        const mapping = await MajorSubjectMapping.findOne({
            where: { major_id, subject_group_id }
        });

        if (!mapping) {
            return res.status(404).json({ message: 'Mapping not found' });
        }

        await mapping.destroy();
        res.json({ message: 'Mapping deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bulkCreateMappings = async (req, res) => {
    try {
        const { mappings } = req.body;

        if (!Array.isArray(mappings) || mappings.length === 0) {
            return res.status(400).json({ 
                message: 'mappings array is required and must not be empty' 
            });
        }

        for (const mapping of mappings) {
            if (!mapping.major_id || !mapping.subject_group_id) {
                return res.status(400).json({ 
                    message: 'Each mapping must have major_id and subject_group_id' 
                });
            }
        }

        const createdMappings = await MajorSubjectMapping.bulkCreate(mappings, {
            ignoreDuplicates: true
        });

        res.status(201).json({
            message: `${createdMappings.length} mappings created successfully`,
            mappings: createdMappings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAllMappingsByMajor = async (req, res) => {
    try {
        const { major_id } = req.params;

        const deletedCount = await MajorSubjectMapping.destroy({
            where: { major_id }
        });

        res.json({ 
            message: `${deletedCount} mappings deleted successfully`,
            count: deletedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const replaceMajorSubjectGroups = async (req, res) => {
    try {
        const { major_id } = req.params;
        const { subject_group_ids } = req.body;

        if (!Array.isArray(subject_group_ids)) {
            return res.status(400).json({ 
                message: 'subject_group_ids array is required' 
            });
        }

        const major = await Major.findByPk(major_id);
        if (!major) {
            return res.status(404).json({ message: 'Major not found' });
        }

        await MajorSubjectMapping.destroy({ where: { major_id } });

        const newMappings = subject_group_ids.map(sg_id => ({
            major_id: parseInt(major_id),
            subject_group_id: sg_id
        }));

        const createdMappings = await MajorSubjectMapping.bulkCreate(newMappings);

        res.json({
            message: `Subject groups updated successfully`,
            count: createdMappings.length,
            mappings: createdMappings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMappingStatistics = async (req, res) => {
    try {
        const totalMappings = await MajorSubjectMapping.count();
        
        const majorStats = await MajorSubjectMapping.findAll({
            attributes: [
                'major_id',
                [Sequelize.fn('COUNT', Sequelize.col('subject_group_id')), 'subject_group_count']
            ],
            include: [{ 
                model: Major, 
                attributes: ['name', 'code'] 
            }],
            group: ['major_id', 'Major.id', 'Major.name', 'Major.code'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('subject_group_id')), 'DESC']],
            limit: 10
        });

        const subjectGroupStats = await MajorSubjectMapping.findAll({
            attributes: [
                'subject_group_id',
                [Sequelize.fn('COUNT', Sequelize.col('major_id')), 'major_count']
            ],
            include: [{ 
                model: SubjectGroup, 
                attributes: ['name', 'code'] 
            }],
            group: ['subject_group_id', 'SubjectGroup.id', 'SubjectGroup.name', 'SubjectGroup.code'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('major_id')), 'DESC']],
            limit: 10
        });

        res.json({
            total_mappings: totalMappings,
            top_majors_by_subject_groups: majorStats,
            top_subject_groups_by_majors: subjectGroupStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllMappings,
    getMappingById,
    getSubjectGroupsByMajor,
    getMajorsBySubjectGroup,
    createMapping,
    deleteMapping,
    bulkCreateMappings,
    deleteAllMappingsByMajor,
    replaceMajorSubjectGroups,
    getMappingStatistics
};
