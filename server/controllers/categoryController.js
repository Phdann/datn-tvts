const { Category, Post } = require('../models/index');
const { Op } = require('sequelize');

const getAllCategories = async (req, res) => {
    try {
        const { search } = req.query;
        
        let where = {};
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        const categories = await Category.findAll({
            where,
            include: [{ model: Post }],
            order: [['name', 'ASC']]
        });

        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [{ model: Post }]
        });
        
        if (!category) return res.status(404).json({ message: 'Category not found' });
        
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const category = await Category.create({ name, description });
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const { name, description } = req.body;
        await category.update({ name, description });

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const postCount = await Post.count({ where: { category_id: category.id } });
        if (postCount > 0) {
            return res.status(400).json({ message: 'Cannot delete category with existing posts' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
