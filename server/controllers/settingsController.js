const { SystemConfig } = require('../models');

const parseValue = (value, type) => {
    switch (type) {
        case 'boolean':
            return value === 'true' || value === true;
        case 'number':
            return parseFloat(value);
        case 'json':
            return typeof value === 'string' ? JSON.parse(value) : value;
        default:
            return value;
    }
};

const stringifyValue = (value, type) => {
    if (type === 'json') {
        return typeof value === 'string' ? value : JSON.stringify(value);
    }
    return String(value);
};

const getAllSettings = async (req, res) => {
    try {
        const configs = await SystemConfig.findAll({
            order: [['key', 'ASC']]
        });

        const parsed = configs.reduce((acc, config) => {
            acc[config.key] = {
                value: parseValue(config.value, config.type),
                type: config.type,
                description: config.description
            };
            return acc;
        }, {});

        res.json(parsed);
    } catch (error) {
        console.error('Get all settings error:', error);
        res.status(500).json({ message: error.message });
    }
};

const getSetting = async (req, res) => {
    try {
        const config = await SystemConfig.findByPk(req.params.key);
        
        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.json({
            key: config.key,
            value: parseValue(config.value, config.type),
            type: config.type,
            description: config.description
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const updates = req.body; // { key1: value1, key2: value2, ... }
        const results = [];

        for (const [key, value] of Object.entries(updates)) {
            const config = await SystemConfig.findByPk(key);
            
            if (config) {
                const stringValue = stringifyValue(value, config.type);
                await config.update({ value: stringValue });
                results.push({ key, updated: true });
            } else {
                results.push({ key, updated: false, error: 'Not found' });
            }
        }

        res.json({
            message: 'Settings updated successfully',
            results
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateSetting = async (req, res) => {
    try {
        const { value } = req.body;
        const config = await SystemConfig.findByPk(req.params.key);
        
        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        const stringValue = stringifyValue(value, config.type);
        await config.update({ value: stringValue });

        res.json({
            key: config.key,
            value: parseValue(stringValue, config.type),
            type: config.type,
            description: config.description
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublicConfig = async (req, res) => {
    try {
        const publicKeys = [
            'university_name',
            'hotline',
            'email',
            'address',
            'admission_open',
            'current_year',
            'admission_deadline',
            'maintenance_mode',
            'gemini_enabled'
        ];

        const configs = await SystemConfig.findAll({
            where: {
                key: publicKeys
            }
        });

        const parsed = configs.reduce((acc, config) => {
            acc[config.key] = parseValue(config.value, config.type);
            return acc;
        }, {});

        res.json(parsed);
    } catch (error) {
        console.error('Get public config error:', error);
        res.status(500).json({ message: error.message });
    }
};

const createSetting = async (req, res) => {
    try {
        const { key, value, description, type } = req.body;

        const stringValue = stringifyValue(value, type || 'text');
        
        const config = await SystemConfig.create({
            key,
            value: stringValue,
            description,
            type: type || 'text'
        });

        res.status(201).json({
            key: config.key,
            value: parseValue(config.value, config.type),
            type: config.type,
            description: config.description
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteSetting = async (req, res) => {
    try {
        const config = await SystemConfig.findByPk(req.params.key);
        
        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        await config.destroy();
        res.json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSettings,
    getSetting,
    updateSettings,
    updateSetting,
    createSetting,
    deleteSetting,
    getPublicConfig
};
