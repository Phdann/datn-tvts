const { Scholarship, ScholarshipImage } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

const getAllScholarships = async (req, res) => {
    try {
        const { is_active, type, time, category, search, startDate, endDate } = req.query;
        let where = {};
        
        if (category) {
            where.category = category;
        }
        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }
        if (type) {
            where.type = type;
        }
        
        // Search by name
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }
        
        // Filter by date range
        if (startDate || endDate) {
            where.time = {};
            if (startDate) where.time[Op.gte] = new Date(startDate);
            if (endDate) where.time[Op.lte] = new Date(endDate);
        } else if (time) {
            // Backward compatibility or specific date
            where.time = time;
        }
        
        const scholarships = await Scholarship.findAll({
            where,
            include: [{
                model: ScholarshipImage,
                as: 'images',
                attributes: ['id', 'url', 'display_order']
            }],
            order: [['time', 'DESC'], ['createdAt', 'DESC']]
        });
        
        res.json(scholarships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getScholarshipById = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id, {
            include: [{
                model: ScholarshipImage,
                as: 'images'
            }]
        });
        if (!scholarship) {
            return res.status(404).json({ message: 'Không tìm thấy học bổng' });
        }
        res.json(scholarship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createScholarship = async (req, res) => {
    try {
        const scholarshipData = { ...req.body };
        
        // Set first image (file or url) as image_url for backward compatibility
        if (req.files && req.files.length > 0) {
            scholarshipData.image_url = req.files[0].path;
        } else if (req.body.image_urls && req.body.image_urls.length > 0) {
            const urls = Array.isArray(req.body.image_urls) ? req.body.image_urls : [req.body.image_urls];
            scholarshipData.image_url = urls[0];
        }
        
        const scholarship = await Scholarship.create(scholarshipData);
        
        // Create multiple images (files and urls)
        let imagesToCreate = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                imagesToCreate.push({
                    scholarship_id: scholarship.id,
                    url: file.path,
                    display_order: imagesToCreate.length
                });
            });
        }
        if (req.body.image_urls) {
            try {
                const urls = typeof req.body.image_urls === 'string' 
                    ? JSON.parse(req.body.image_urls) 
                    : req.body.image_urls;
                const urlArr = Array.isArray(urls) ? urls : [urls];
                urlArr.forEach(url => {
                    if (url) imagesToCreate.push({
                        scholarship_id: scholarship.id,
                        url,
                        display_order: imagesToCreate.length
                    });
                });
            } catch (e) {
                if (req.body.image_urls) imagesToCreate.push({
                    scholarship_id: scholarship.id,
                    url: req.body.image_urls,
                    display_order: imagesToCreate.length
                });
            }
        }

        if (imagesToCreate.length > 0) {
            await ScholarshipImage.bulkCreate(imagesToCreate);
        }
        
        const createdScholarship = await Scholarship.findByPk(scholarship.id, {
            include: [{ model: ScholarshipImage, as: 'images' }]
        });
        
        res.status(201).json(createdScholarship);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id, {
            include: [{ model: ScholarshipImage, as: 'images' }]
        });
        
        if (!scholarship) {
            return res.status(404).json({ message: 'Không tìm thấy học bổng' });
        }
        
        const updateData = { ...req.body };
        
        // Handle deleted images
        if (req.body.deletedImageIds) {
            const deletedIds = JSON.parse(req.body.deletedImageIds);
            await ScholarshipImage.destroy({
                where: { id: deletedIds, scholarship_id: scholarship.id }
            });
        }
        
        // Add new images (files and urls)
        let imagesToCreate = [];
        const currentImages = await ScholarshipImage.findAll({ where: { scholarship_id: scholarship.id } });
        let maxOrder = currentImages.reduce((max, img) => Math.max(max, img.display_order), -1);

        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                maxOrder++;
                imagesToCreate.push({
                    scholarship_id: scholarship.id,
                    url: file.path,
                    display_order: maxOrder
                });
            });
        }

        if (req.body.image_urls) {
            try {
                const urls = typeof req.body.image_urls === 'string' 
                    ? JSON.parse(req.body.image_urls) 
                    : req.body.image_urls;
                const urlArr = Array.isArray(urls) ? urls : [urls];
                urlArr.forEach(url => {
                    if (url) {
                        maxOrder++;
                        imagesToCreate.push({
                            scholarship_id: scholarship.id,
                            url,
                            display_order: maxOrder
                        });
                    }
                });
            } catch (e) {
                if (req.body.image_urls) {
                    maxOrder++;
                    imagesToCreate.push({
                        scholarship_id: scholarship.id,
                        url: req.body.image_urls,
                        display_order: maxOrder
                    });
                }
            }
        }

        if (imagesToCreate.length > 0) {
            await ScholarshipImage.bulkCreate(imagesToCreate);
        }
        
        // Update main image_url if not set or if it was deleted
        const updatedImages = await ScholarshipImage.findAll({
            where: { scholarship_id: scholarship.id },
            order: [['display_order', 'ASC']]
        });
        
        if (updatedImages.length > 0) {
            updateData.image_url = updatedImages[0].url;
        } else {
            updateData.image_url = null;
        }
        
        await scholarship.update(updateData);
        
        const result = await Scholarship.findByPk(req.params.id, {
            include: [{ model: ScholarshipImage, as: 'images' }]
        });
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteScholarship = async (req, res) => {
    try {
        const scholarship = await Scholarship.findByPk(req.params.id);
        
        if (!scholarship) {
            return res.status(404).json({ message: 'Không tìm thấy học bổng' });
        }
        
        await scholarship.destroy();
        res.json({ message: 'Đã xóa học bổng' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllScholarships,
    getScholarshipById,
    createScholarship,
    updateScholarship,
    deleteScholarship
};
