const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;
        const where = {};
        
        if (status) where.status = status;
        
        const include = [{ 
            model: Role,
            where: role ? { name: role } : undefined
        }];

        const offset = (page - 1) * limit;

        let { count, rows } = await User.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        if (search) {
            rows = rows.filter(u => u.email.toLowerCase().includes(search.toLowerCase()));
            count = rows.length;
        }

        res.json({
            data: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { email, password, role_id } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword,
            role_id,
            status: 'active'
        });

        const userWithRole = await User.findByPk(user.id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        res.status(201).json(userWithRole);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { password, ...updateData } = req.body;

        await user.update(updateData);

        const updatedUser = await User.findByPk(user.id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const lockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot lock your own account' });
        }

        await user.update({ status: 'banned' });

        const updatedUser = await User.findByPk(user.id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const unlockUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.update({ status: 'active' });

        const updatedUser = await User.findByPk(user.id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id !== req.user.id && req.user.Role.name !== 'Admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (user.id === req.user.id) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const assignRole = async (req, res) => {
    try {
        const { role_id } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id === req.user.id) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }

        await user.update({ role_id });

        const updatedUser = await User.findByPk(user.id, {
            include: [{ model: Role }],
            attributes: { exclude: ['password'] }
        });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    getCurrentUser,
    createUser,
    updateUser,
    deleteUser,
    lockUser,
    unlockUser,
    changePassword,
    assignRole
};
