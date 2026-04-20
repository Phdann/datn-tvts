const { Banner } = require('../models');
const path = require('path');
const fs = require('fs').promises;

const getAllBanners = async (req, res) => {
    try {
        const { is_active, faculty_id, position } = req.query;
        let where = {};
        
        if (is_active !== undefined) {
            where.is_active = is_active === 'true';
        }

        if (faculty_id) {
            where.faculty_id = faculty_id;
        } else if (faculty_id === 'null') {
            where.faculty_id = null;
        }

        if (position) {
            where.position = position;
        }
        
        const banners = await Banner.findAll({
            where,
            order: [['display_order', 'ASC'], ['createdAt', 'DESC']]
        });
        
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findByPk(req.params.id);
        
        if (!banner) {
            return res.status(404).json({ message: 'Không tìm thấy banner' });
        }
        
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createBanner = async (req, res) => {
    try {
        let image_url = '';
        if (req.file) {
            image_url = req.file.path;
        } else if (req.body.image_url) {
            image_url = req.body.image_url;
        }

        if (!image_url) {
            return res.status(400).json({ message: 'Vui lòng upload ảnh hoặc nhập link ảnh' });
        }
        
        const bannerData = {
            title: req.body.title,
            link_url: req.body.link_url,
            position: req.body.position || 'main_top',
            image_url
        };

        // Ép kiểu dữ liệu an toàn
        if (req.body.is_active !== undefined) {
            bannerData.is_active = String(req.body.is_active) === 'true';
        }

        if (req.body.faculty_id && req.body.faculty_id !== 'null' && req.body.faculty_id !== '') {
            bannerData.faculty_id = parseInt(req.body.faculty_id);
        } else {
            bannerData.faculty_id = null;
        }

        if (req.body.display_order) {
            bannerData.display_order = parseInt(req.body.display_order);
        }
        
        const banner = await Banner.create(bannerData);
        res.status(201).json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByPk(req.params.id);
        
        if (!banner) {
            return res.status(404).json({ message: 'Không tìm thấy banner' });
        }
        
        const updateData = {};
        
        // Chỉ cập nhật các trường được gửi lên
        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.link_url !== undefined) updateData.link_url = req.body.link_url;
        if (req.body.position !== undefined) updateData.position = req.body.position;
        if (req.body.display_order !== undefined) updateData.display_order = parseInt(req.body.display_order);
        
        if (req.body.is_active !== undefined) {
            updateData.is_active = String(req.body.is_active) === 'true';
        }

        if (req.body.faculty_id !== undefined) {
            if (req.body.faculty_id === 'null' || req.body.faculty_id === '') {
                updateData.faculty_id = null;
            } else {
                updateData.faculty_id = parseInt(req.body.faculty_id);
            }
        }
        
        if (req.file) {
            updateData.image_url = req.file.path;
        } else if (req.body.image_url) {
            updateData.image_url = req.body.image_url;
        }
        
        await banner.update(updateData);
        res.json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByPk(req.params.id);
        
        if (!banner) {
            return res.status(404).json({ message: 'Không tìm thấy banner' });
        }
        
        await banner.destroy();
        res.json({ message: 'Đã xóa banner' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBannerOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { display_order } = req.body;
        
        const banner = await Banner.findByPk(id);
        if (!banner) {
            return res.status(404).json({ message: 'Không tìm thấy banner' });
        }
        
        await banner.update({ display_order });
        res.json(banner);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBanner,
    deleteBanner,
    updateBannerOrder
};
