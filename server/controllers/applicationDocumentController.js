const { ApplicationDocument, Application } = require('../models/index');
const path = require('path');
const fs = require('fs');

const getAllDocuments = async (req, res) => {
    try {
        const { application_id, type, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (application_id) where.application_id = application_id;
        if (type) where.type = type;

        const { count, rows } = await ApplicationDocument.findAndCountAll({
            where,
            include: [{ 
                model: Application, 
                attributes: ['id', 'candidate_name', 'email'] 
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            documents: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDocumentById = async (req, res) => {
    try {
        const document = await ApplicationDocument.findByPk(req.params.id, {
            include: [{ 
                model: Application, 
                attributes: ['id', 'candidate_name', 'email', 'phone'] 
            }]
        });
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDocumentsByApplication = async (req, res) => {
    try {
        const { application_id } = req.params;

        const application = await Application.findByPk(application_id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const documents = await ApplicationDocument.findAll({
            where: { application_id },
            order: [['type', 'ASC'], ['createdAt', 'DESC']]
        });

        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDocument = async (req, res) => {
    try {
        const { application_id, type, file_url } = req.body;
        
        if (!application_id || !type || !file_url) {
            return res.status(400).json({ 
                message: 'application_id, type, and file_url are required' 
            });
        }

        const application = await Application.findByPk(application_id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const document = await ApplicationDocument.create({
            application_id,
            type,
            file_url
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDocument = async (req, res) => {
    try {
        const document = await ApplicationDocument.findByPk(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const { type, file_url } = req.body;
        await document.update({ type, file_url });

        res.json(document);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const document = await ApplicationDocument.findByPk(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

      

        await document.destroy();
        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const downloadDocument = async (req, res) => {
    try {
        const document = await ApplicationDocument.findByPk(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.file_url.startsWith('http')) {
            return res.redirect(document.file_url);
        }

        const filePath = path.join(__dirname, '../../uploads', document.file_url);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDocumentStatistics = async (req, res) => {
    try {
        const { Sequelize } = require('sequelize');
        
        const stats = await ApplicationDocument.findAll({
            attributes: [
                'type',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
            ],
            group: ['type'],
            order: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'DESC']]
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bulkCreateDocuments = async (req, res) => {
    try {
        const { documents } = req.body;

        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ 
                message: 'documents array is required and must not be empty' 
            });
        }

        for (const doc of documents) {
            if (!doc.application_id || !doc.type || !doc.file_url) {
                return res.status(400).json({ 
                    message: 'Each document must have application_id, type, and file_url' 
                });
            }
        }

        const createdDocuments = await ApplicationDocument.bulkCreate(documents);
        res.status(201).json({
            message: `${createdDocuments.length} documents created successfully`,
            documents: createdDocuments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllDocuments,
    getDocumentById,
    getDocumentsByApplication,
    createDocument,
    updateDocument,
    deleteDocument,
    downloadDocument,
    getDocumentStatistics,
    bulkCreateDocuments
};
