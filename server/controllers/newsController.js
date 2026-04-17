const { News } = require('../models');
const path = require('path');
const fs = require('fs').promises;

const getAllNews = async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const where = status ? { status } : {};
        const offset = (page - 1) * limit;
        
        const { count, rows } = await News.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            data: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getNewsById = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        
        if (!news) {
            return res.status(404).json({ message: 'Không tìm thấy tin tức' });
        }
        
        await news.increment('views');
        
        res.json(news);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createNews = async (req, res) => {
    try {
        const newsData = { ...req.body };
        
        if (req.file) {
            newsData.featured_image = req.file.path;
        }
        
        if (!newsData.slug && newsData.title) {
            newsData.slug = newsData.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[đĐ]/g, 'd')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
        }
        
        const news = await News.create(newsData);
        res.status(201).json(news);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        
        if (!news) {
            return res.status(404).json({ message: 'Không tìm thấy tin tức' });
        }
        
        const updateData = { ...req.body };
        
        if (req.file) {
            updateData.featured_image = req.file.path;
        }
        
        await news.update(updateData);
        res.json(news);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteNews = async (req, res) => {
    try {
        const news = await News.findByPk(req.params.id);
        
        if (!news) {
            return res.status(404).json({ message: 'Không tìm thấy tin tức' });
        }
        
        await news.destroy();
        res.json({ message: 'Đã xóa tin tức' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};
