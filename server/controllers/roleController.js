const { Role } = require('../models');

const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            order: [['name', 'ASC']]
        });
        res.json(roles);
    } catch (error) {
        console.error('Get all roles error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getRoleById = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        res.status(201).json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        
        await role.update(req.body);
        res.json(role);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByPk(req.params.id);
        
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        
        await role.destroy();
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
};
