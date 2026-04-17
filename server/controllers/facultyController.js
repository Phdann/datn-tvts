const { Faculty, Major, Specialization } = require('../models/index');
const { Op } = require('sequelize');

const generateSlug = (text) => {
    return text
        .toLowerCase()
        .normalize("NFD")  
        .replace(/[\u0300-\u036f]/g, "")  
        .replace(/[đĐ]/g, "d")  
        .replace(/[^a-z0-9]/g, "-")  
        .replace(/-+/g, "-")  
        .replace(/^-|-$/g, "");  
};

const getAllFaculties = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        
        let where = {};
        if (search) {
            where.name = { [Op.like]: `%${search}%` };
        }

        if (!limit && !page) {
            const faculties = await Faculty.findAll({
                where,
                include: [{ 
                    model: Major,
                    as: 'Majors',
                    include: [{ model: Specialization, as: 'Specializations' }]
                }],
                order: [['name', 'ASC']]
            });
            return res.json(faculties);
        }

        const offset = (page - 1) * limit;
        const { count, rows } = await Faculty.findAndCountAll({
            where,
            include: [{ 
                model: Major,
                as: 'Majors',
                include: [{ model: Specialization, as: 'Specializations' }]
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']]
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

const getFacultyById = async (req, res) => {
    try {
        const faculty = await Faculty.findByPk(req.params.id, {
            include: [{ model: Major, as: 'Majors' }]
        });
        
        if (!faculty) return res.status(404).json({ message: 'Không tìm thấy khoa' });
        
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFaculty = async (req, res) => {
    try {
        const { name, code, introduction } = req.body;
        let { logo_url, banner_image_url } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Tên khoa là bắt buộc' });
        }

        // Handle file uploads
        if (req.files?.logo_url?.[0]) {
            logo_url = req.files.logo_url[0].path;
        }
        if (req.files?.banner_image_url?.[0]) {
            banner_image_url = req.files.banner_image_url[0].path;
        }

        const slug = generateSlug(name);

        const faculty = await Faculty.create({ 
            name, 
            code, 
            introduction, 
            logo_url,
            banner_image_url,
            slug 
        });
        
        res.status(201).json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findByPk(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Không tìm thấy khoa' });

        const { name, code, introduction } = req.body;
        let { logo_url, banner_image_url } = req.body;
        
        let slug = faculty.slug;
        
        if (!faculty.slug || (name && name !== faculty.name)) {
            const nameToUse = name || faculty.name;
            slug = generateSlug(nameToUse);
        }

        // Handle file uploads
        if (req.files?.logo_url?.[0]) {
            logo_url = req.files.logo_url[0].path;
        }
        if (req.files?.banner_image_url?.[0]) {
            banner_image_url = req.files.banner_image_url[0].path;
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (code !== undefined) updateData.code = code === '' ? null : code;
        if (introduction !== undefined) updateData.introduction = introduction === '' ? null : introduction;
        if (logo_url !== undefined) updateData.logo_url = logo_url === '' ? null : logo_url;
        if (banner_image_url !== undefined) updateData.banner_image_url = banner_image_url === '' ? null : banner_image_url;
        if (slug !== faculty.slug) updateData.slug = slug;

        await faculty.update(updateData);

        res.json(faculty);
    } catch (error) {
        console.error('Lỗi updateFaculty:', error);
        res.status(500).json({ message: 'Không thể cập nhật thông tin khoa' });
    }
};

const deleteFaculty = async (req, res) => {
    try {
        const faculty = await Faculty.findByPk(req.params.id);
        if (!faculty) return res.status(404).json({ message: 'Không tìm thấy khoa' });

        const majorCount = await Major.count({ where: { faculty_id: faculty.id } });
        if (majorCount > 0) {
            return res.status(400).json({ message: `Không thể xóa khoa này vì vẫn còn ${majorCount} ngành học trực thuộc. Vui lòng xóa các ngành học trước.` });
        }

        await faculty.destroy();
        res.json({ message: 'Xóa khoa thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFacultyBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        let faculty;

        // Handle both slug and numeric ID
        if (/^\d+$/.test(slug)) {
            // If slug is numeric, treat it as ID
            faculty = await Faculty.findByPk(slug, {
                include: [{ 
                    model: Major,
                    as: 'Majors',
                    include: [{ model: Specialization, as: 'Specializations' }]
                }]
            });
        } else {
            // Otherwise search by slug
            faculty = await Faculty.findOne({
                where: { slug },
                include: [{ 
                    model: Major,
                    as: 'Majors',
                    include: [{ model: Specialization, as: 'Specializations' }]
                }]
            });
        }
        
        if (!faculty) return res.status(404).json({ message: 'Không tìm thấy khoa' });
        
        res.json(faculty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const fixSlugs = async (req, res) => {
    try {
        const faculties = await Faculty.findAll();
        const results = [];
        
        for (const faculty of faculties) {
            const slug = faculty.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");
            
            await faculty.update({ slug });
            results.push({ id: faculty.id, name: faculty.name, slug });
        }
        
        res.json({ message: 'Cập nhật slug thành công', results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllFaculties,
    getFacultyById,
    getFacultyBySlug,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    fixSlugs
};
