const { Post, Category, User } = require('../models/index');
const { Op } = require('sequelize');

const getAllPosts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            category_id, 
            status, 
            author_id, 
            faculty_id,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;
        const offset = (page - 1) * limit;
        
        let where = {};
        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }
        if (category_id) where.category_id = category_id;
        if (status) where.status = status;
        if (author_id) where.author_id = author_id;
        if (faculty_id) where.faculty_id = faculty_id;

        const { count, rows } = await Post.findAndCountAll({
            where,
            include: [
                { model: Category },
                { model: User, attributes: ['id', 'email'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder]]
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

const getPublishedPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category_id, category_slug } = req.query;
        const offset = (page - 1) * limit;
        
        let where = { status: 'published' };
        
        if (category_slug) {
            const category = await Category.findOne({ where: { slug: category_slug } });
            if (category) {
                where.category_id = category.id;
            } else {
                return res.json({
                    total: 0,
                    page: parseInt(page),
                    totalPages: 0,
                    data: []
                });
            }
        } else if (category_id) {
            where.category_id = category_id;
        }

        const { count, rows } = await Post.findAndCountAll({
            where,
            include: [
                { model: Category },
                { model: User, attributes: ['id', 'email'] }
            ],
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

const getPostById = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: [
                { model: Category },
                { model: User, attributes: ['id', 'email'] }
            ]
        });
        
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { title, content, category_id, status = 'draft' } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = await Post.create({
            title,
            content,
            category_id: category_id || null,
            author_id: req.user?.id, 
            status,
            image_url: req.file ? `/uploads/posts/${req.file.filename}` : req.body.image_url
        });

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const { title, content, category_id, status, image_url } = req.body;
        const updateData = { title, content, category_id: category_id || null, status };
        
        if (req.file) {
            updateData.image_url = `/uploads/posts/${req.file.filename}`;
        } else if (image_url !== undefined) {
            updateData.image_url = image_url;
        }

        await post.update(updateData);

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        await post.destroy();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const publishPost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        await post.update({ status: 'published' });
        res.json({ message: 'Post published successfully', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unpublishPost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        await post.update({ status: 'draft' });
        res.json({ message: 'Post unpublished successfully', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({
            where: { slug: req.params.slug },
            include: [
                { model: Category },
                { model: User, attributes: ['id', 'email'] }
            ]
        });
        
        if (!post) return res.status(404).json({ message: 'Post not found' });
        
        await post.increment('views');
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPosts,
    getPublishedPosts,
    getPostById,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    publishPost,
    unpublishPost
};
