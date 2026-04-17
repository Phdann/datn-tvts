const { MajorImage, Major } = require('../models');
const fs = require('fs');
const path = require('path');

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const getMajorImages = async (req, res) => {
    try {
        const { id } = req.params;
        const images = await MajorImage.findAll({
            where: { major_id: id },
            order: [['display_order', 'ASC'], ['id', 'ASC']]
        });
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadMajorImages = async (req, res) => {
    try {
        const { id } = req.params;
        const major = await Major.findByPk(id);
        
        if (!major) {
            return res.status(404).json({ message: 'Major not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const maxOrderResult = await MajorImage.max('display_order', { where: { major_id: id } });
        let nextOrder = (maxOrderResult || 0) + 1;

        const imageRecords = req.files.map(file => ({
            major_id: id,
            image_url: file.path, // Cloudinary returns the full URL in file.path
            display_order: nextOrder++
        }));

        const createdImages = await MajorImage.bulkCreate(imageRecords);
        res.status(201).json(createdImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteMajorImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const image = await MajorImage.findByPk(imageId);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const filePath = path.join(__dirname, '..', image.image_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await image.destroy();
        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateImageOrder = async (req, res) => {
    try {
        const { imageId } = req.params;
        const { display_order } = req.body;
        
        const image = await MajorImage.findByPk(imageId);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        await image.update({ display_order });
        res.json(image);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMajorImages,
    uploadMajorImages,
    deleteMajorImage,
    updateImageOrder
};
