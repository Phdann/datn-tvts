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
            image_url = `/uploads/banners/${req.file.filename}`;
        } else if (req.body.image_url) {
            image_url = req.body.image_url;
        }

        if (!image_url) {
            return res.status(400).json({ message: 'Vui lòng upload ảnh hoặc nhập link ảnh' });
        }
        
        const bannerData = {
            ...req.body,
            image_url
        };

        if (bannerData.faculty_id === 'null' || bannerData.faculty_id === '') {
            bannerData.faculty_id = null;
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
        
        const updateData = { ...req.body };

        if (updateData.faculty_id === 'null' || updateData.faculty_id === '') {
            updateData.faculty_id = null;
        }
        
        if (req.file) {
            if (banner.image_url && banner.image_url.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, '..', banner.image_url);
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
            updateData.image_url = `/uploads/banners/${req.file.filename}`;
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
        
        if (banner.image_url) {
            const imagePath = path.join(__dirname, '..', banner.image_url);
            try {
                await fs.unlink(imagePath);
            } catch (err) {
                console.error('Error deleting image:', err);
            }
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
