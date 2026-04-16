const { Specialization, Major, Faculty } = require('../models');

const getAllSpecializations = async (req, res) => {
    try {
        const { major_id, faculty_id } = req.query;
        const where = {};
        
        if (major_id) {
            where.major_id = major_id;
        }
        
        const specializations = await Specialization.findAll({
            where,
            include: [{ 
                model: Major, 
                attributes: ['id', 'name', 'code', 'faculty_id'],
                include: [{ 
                    model: Faculty, 
                    attributes: ['id', 'name', 'code']
                }],
                ...(faculty_id ? { where: { faculty_id } } : {})
            }],
            order: [['name', 'ASC']]
        });
        
        res.json(specializations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSpecializationById = async (req, res) => {
    try {
        const specialization = await Specialization.findByPk(req.params.id, {
            include: [{ 
                model: Major,
                include: [{ model: Faculty }]
            }]
        });
        
        if (!specialization) {
            return res.status(404).json({ message: 'Không tìm thấy chuyên ngành' });
        }
        
        res.json(specialization);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSpecialization = async (req, res) => {
    try {
        const specialization = await Specialization.create(req.body);
        
        const created = await Specialization.findByPk(specialization.id, {
            include: [{ 
                model: Major,
                include: [{ model: Faculty }]
            }]
        });
        
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateSpecialization = async (req, res) => {
    try {
        const specialization = await Specialization.findByPk(req.params.id);
        
        if (!specialization) {
            return res.status(404).json({ message: 'Không tìm thấy chuyên ngành' });
        }
        
        await specialization.update(req.body);
        
        const updated = await Specialization.findByPk(specialization.id, {
            include: [{ 
                model: Major,
                include: [{ model: Faculty }]
            }]
        });
        
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteSpecialization = async (req, res) => {
    try {
        const specialization = await Specialization.findByPk(req.params.id);
        
        if (!specialization) {
            return res.status(404).json({ message: 'Không tìm thấy chuyên ngành' });
        }
        
        await specialization.destroy();
        res.json({ message: 'Đã xóa chuyên ngành' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSpecializations,
    getSpecializationById,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization
};
