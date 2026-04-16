const { TrainingType } = require('../models');

const getAllTrainingTypes = async (req, res) => {
    try {
        const { is_visible } = req.query;
        let where = {};
        if (is_visible !== undefined) where.is_visible = is_visible === 'true';
        
        const trainingTypes = await TrainingType.findAll({ 
            where,
            order: [['year', 'DESC'], ['name', 'ASC']]
        });
        res.json(trainingTypes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrainingTypeById = async (req, res) => {
    try {
        const trainingType = await TrainingType.findByPk(req.params.id);
        if (!trainingType) return res.status(404).json({ message: 'Training Type not found' });
        res.json(trainingType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTrainingType = async (req, res) => {
    try {
        const { name, content_text, year, is_visible } = req.body;
        
        let image_url = null;
        let image_urls = [];
        
        // Handle files
        if (req.files && req.files.length > 0) {
            image_urls = req.files.map(f => `/uploads/training-types/${f.filename}`);
        }
        
        // Handle URLs from body
        if (req.body.image_urls) {
            const urls = Array.isArray(req.body.image_urls) ? req.body.image_urls : [req.body.image_urls];
            image_urls = [...image_urls, ...urls];
        }

        if (image_urls.length > 0) {
            image_url = image_urls[0];
        }

        const trainingType = await TrainingType.create({
            name,
            content_text,
            image_url,
            image_urls,
            year,
            is_visible: is_visible !== undefined ? is_visible : true
        });

        res.status(201).json(trainingType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTrainingType = async (req, res) => {
    try {
        const trainingType = await TrainingType.findByPk(req.params.id);
        if (!trainingType) return res.status(404).json({ message: 'Training Type not found' });

        const { name, content_text, year, is_visible } = req.body;
        let updateData = { name, content_text, year, is_visible };

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
            new_image_urls = req.files.map(f => `/uploads/training-types/${f.filename}`);
        }

        // Handle URLs from body
        if (req.body.image_urls) {
            const urls = Array.isArray(req.body.image_urls) ? req.body.image_urls : [req.body.image_urls];
            new_image_urls = [...new_image_urls, ...urls];
        }

        const final_image_urls = [...kept_images, ...new_image_urls];
        updateData.image_urls = final_image_urls;
        updateData.image_url = final_image_urls.length > 0 ? final_image_urls[0] : null;

        await trainingType.update(updateData);
        res.json(trainingType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTrainingType = async (req, res) => {
    try {
        const trainingType = await TrainingType.findByPk(req.params.id);
        if (!trainingType) return res.status(404).json({ message: 'Training Type not found' });

        await trainingType.destroy();
        res.json({ message: 'Training Type deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllTrainingTypes,
    getTrainingTypeById,
    createTrainingType,
    updateTrainingType,
    deleteTrainingType
};
