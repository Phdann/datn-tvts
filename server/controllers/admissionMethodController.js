const { AdmissionMethod, HistoricalScore, Application } = require('../models/index');
const { Op } = require('sequelize');

const getAllAdmissionMethods = async (req, res) => {
    try {
        const { page = 1, limit = 20, type } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (type) where.type = type;

        const { count, rows } = await AdmissionMethod.findAndCountAll({
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

const getAdmissionMethodById = async (req, res) => {
    try {
        const method = await AdmissionMethod.findByPk(req.params.id, {
            include: [
                { model: HistoricalScore },
                { model: Application }
            ]
        });
        
        if (!method) return res.status(404).json({ message: 'Admission method not found' });
        
        res.json(method);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAdmissionMethod = async (req, res) => {
    try {
        const { name, description, year, is_public, type } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        let image_url = null;
        let image_urls = [];
        
        // Handle files
        if (req.files && req.files.length > 0) {
            image_urls = req.files.map(file => `/uploads/methods/${file.filename}`);
        }
        
        // Handle URLs
        if (req.body.image_urls) {
            try {
                const urls = typeof req.body.image_urls === 'string' 
                    ? JSON.parse(req.body.image_urls) 
                    : req.body.image_urls;
                image_urls = [...image_urls, ...(Array.isArray(urls) ? urls : [urls])];
            } catch (e) {
                image_urls = [...image_urls, req.body.image_urls];
            }
        }

        if (image_urls.length > 0) {
            image_url = image_urls[0];
        }

        const isPublicBool = is_public !== undefined ? (is_public === 'true') : true;

        const method = await AdmissionMethod.create({ 
            name, 
            description, 
            image_url,
            image_urls,
            year: year ? parseInt(year) : null, 
            is_public: isPublicBool,
            type: type || 'method'
        });
        res.status(201).json(method);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAdmissionMethod = async (req, res) => {
    try {
        const method = await AdmissionMethod.findByPk(req.params.id);
        if (!method) return res.status(404).json({ message: 'Admission method not found' });

        const { name, description, year, is_public, type } = req.body;

        let kept_images = [];
        if (req.body.kept_images) {
            try {
                kept_images = JSON.parse(req.body.kept_images);
            } catch (e) {
                if (typeof req.body.kept_images === 'string') kept_images = [req.body.kept_images];
            }
        }

        let new_image_urls = [];
        if (req.files && req.files.length > 0) {
            new_image_urls = req.files.map(f => `/uploads/methods/${f.filename}`);
        }

        // Handle newly added URLs from body
        if (req.body.image_urls) {
            try {
                const urls = typeof req.body.image_urls === 'string' 
                    ? JSON.parse(req.body.image_urls) 
                    : req.body.image_urls;
                new_image_urls = [...new_image_urls, ...(Array.isArray(urls) ? urls : [urls])];
            } catch (e) {
                new_image_urls = [...new_image_urls, req.body.image_urls];
            }
        }

        const final_image_urls = [...kept_images, ...new_image_urls];

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (year !== undefined) updateData.year = year ? parseInt(year) : null;
        if (type !== undefined) updateData.type = type;
        if (is_public !== undefined) updateData.is_public = (is_public === 'true');

        updateData.image_urls = final_image_urls;
        updateData.image_url = final_image_urls.length > 0 ? final_image_urls[0] : null;

        await method.update(updateData);

        res.json(method);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAdmissionMethod = async (req, res) => {
    try {
        const method = await AdmissionMethod.findByPk(req.params.id);
        if (!method) return res.status(404).json({ message: 'Admission method not found' });

        const applicationCount = await Application.count({ where: { admission_method_id: method.id } });
        const scoreCount = await HistoricalScore.count({ where: { method_id: method.id } });
        
        if (applicationCount > 0 || scoreCount > 0) {
            return res.status(400).json({ message: 'Cannot delete admission method that is in use' });
        }

        await method.destroy();
        res.json({ message: 'Admission method deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllAdmissionMethods,
    getAdmissionMethodById,
    createAdmissionMethod,
    updateAdmissionMethod,
    deleteAdmissionMethod
};
