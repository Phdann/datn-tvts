const { Application, Candidate, Major, AdmissionMethod, ApplicationDocument } = require('../models/index');
const { Op } = require('sequelize');
const db = require('../models/index');

const getAllApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, major_id, method_id, search, from_date, to_date } = req.query;
        const offset = (page - 1) * limit;
        
        let where = {};
        let candidateWhere = {};
        
        if (status) where.status = status;
        if (major_id) where.major_id = major_id;
        if (method_id) where.method_id = method_id;
        
        if (search) {
            candidateWhere[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }
        
        if (from_date || to_date) {
            where.createdAt = {};
            if (from_date) where.createdAt[Op.gte] = new Date(from_date);
            if (to_date) where.createdAt[Op.lte] = new Date(to_date);
        }

        const { count, rows } = await Application.findAndCountAll({
            where,
            include: [
                { model: Candidate, where: Object.keys(candidateWhere).length > 0 ? candidateWhere : undefined },
                { model: Major },
                { model: AdmissionMethod },
                { model: ApplicationDocument }
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

const getApplicationById = async (req, res) => {
    try {
        const application = await Application.findByPk(req.params.id, {
            include: [
                { model: Candidate },
                { model: Major },
                { model: AdmissionMethod },
                { model: ApplicationDocument }
            ]
        });
        
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        res.json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitApplication = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const { name, email, phone, high_school_score, major_id, method_id } = req.body;
        
        if (!name || !email || !phone || !major_id || !method_id) {
            await transaction.rollback();
            return res.status(400).json({ message: 'Missing required fields' });
        }

        let candidate = await Candidate.findOne({ where: { email }, transaction });
        if (!candidate) {
            candidate = await Candidate.create({
                name,
                email,
                phone,
                high_school_score
            }, { transaction });
        }

        const application = await Application.create({
            candidate_id: candidate.id,
            major_id,
            method_id,
            status: 'Pending'
        }, { transaction });

        if (req.files && req.files.length > 0) {
            const documents = req.files.map(file => ({
                application_id: application.id,
                file_url: file.path,
                document_type: file.fieldname
            }));
            await ApplicationDocument.bulkCreate(documents, { transaction });
        }

        await transaction.commit();
        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { status, note, adminNotes } = req.body;
        
        if (!['Pending', 'Processing', 'Reviewing', 'Approved', 'Rejected', 'SupplementNeeded'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const application = await Application.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        application.status = status;
        if (note !== undefined) application.note = note;
        if (adminNotes !== undefined) application.adminNotes = adminNotes;
        await application.save();

        res.json({ message: 'Status updated successfully', application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveApplication = async (req, res) => {
    try {
        const application = await Application.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        application.status = 'Approved';
        await application.save();

        res.json({ message: 'Application approved successfully', application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rejectApplication = async (req, res) => {
    try {
        const { reason } = req.body;
        const application = await Application.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        application.status = 'Rejected';
        application.note = reason || 'Rejected by admin';
        await application.save();

        res.json({ message: 'Application rejected successfully', application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const requestSupplement = async (req, res) => {
    try {
        const { message } = req.body;
        const application = await Application.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });
        
        application.status = 'SupplementNeeded';
        application.note = message || 'Additional documents required';
        await application.save();

        res.json({ message: 'Supplement request sent successfully', application });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const application = await Application.findByPk(req.params.id);
        if (!application) return res.status(404).json({ message: 'Application not found' });

        const document = await ApplicationDocument.create({
            application_id: application.id,
            file_url: req.file.path,
            document_type: req.body.document_type || 'supplement'
        });

        res.status(201).json({ message: 'Document uploaded successfully', document });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const exportToExcel = async (req, res) => {
    try {
        const { status, major_id, from_date, to_date } = req.query;
        
        let where = {};
        if (status) where.status = status;
        if (major_id) where.major_id = major_id;
        if (from_date || to_date) {
            where.createdAt = {};
            if (from_date) where.createdAt[Op.gte] = new Date(from_date);
            if (to_date) where.createdAt[Op.lte] = new Date(to_date);
        }

        const applications = await Application.findAll({
            where,
            include: [
                { model: Candidate },
                { model: Major },
                { model: AdmissionMethod }
            ],
            order: [['createdAt', 'DESC']]
        });

        const csv = [
            ['ID', 'Candidate Name', 'Email', 'Phone', 'Major', 'Method', 'Status', 'Score', 'Date'].join(','),
            ...applications.map(app => [
                app.id,
                app.Candidate?.name || '',
                app.Candidate?.email || '',
                app.Candidate?.phone || '',
                app.Major?.name || '',
                app.AdmissionMethod?.name || '',
                app.status,
                app.Candidate?.high_school_score || '',
                app.createdAt.toISOString().split('T')[0]
            ].join(','))
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteApplication = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const application = await Application.findByPk(req.params.id, { transaction });
        if (!application) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Application not found' });
        }

        await ApplicationDocument.destroy({ where: { application_id: application.id }, transaction });
        await application.destroy({ transaction });

        await transaction.commit();
        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllApplications,
    getApplicationById,
    submitApplication,
    updateApplicationStatus,
    approveApplication,
    rejectApplication,
    requestSupplement,
    uploadDocument,
    exportToExcel,
    deleteApplication
};
