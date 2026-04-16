const { Event } = require('../models');
const path = require('path');
const fs = require('fs').promises;

const getAllEvents = async (req, res) => {
    try {
        const { status, limit = 20, page = 1 } = req.query;
        const where = status ? { status } : {};
        const offset = (page - 1) * limit;
        
        const { count, rows } = await Event.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset,
            order: [['event_date', 'DESC']]
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

const getEventById = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
        
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const eventData = { ...req.body };
        
        if (req.file) {
            eventData.image = `/uploads/events/${req.file.filename}`;
        }
        
        const event = await Event.create(eventData);
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
        
        const updateData = { ...req.body };
        
        if (req.file) {
            if (event.image) {
                const oldImagePath = path.join(__dirname, '..', event.image);
                try {
                    await fs.unlink(oldImagePath);
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
            updateData.image = `/uploads/events/${req.file.filename}`;
        }
        
        await event.update(updateData);
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByPk(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
        
        if (event.image) {
            const imagePath = path.join(__dirname, '..', event.image);
            try {
                await fs.unlink(imagePath);
            } catch (err) {
                console.error('Error deleting image:', err);
            }
        }
        
        await event.destroy();
        res.json({ message: 'Đã xóa sự kiện' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
