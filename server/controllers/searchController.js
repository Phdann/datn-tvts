const {
  Major,
  Faculty,
  Post,
  Event,
  Specialization,
  SubjectGroup,
  HistoricalScore,
  AdmissionMethod,
} = require('../models/index');
const { Op } = require('sequelize');


const globalSearch = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    // Validate input
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        message: 'Keyword is required and must be a string',
        success: false,
      });
    }

    const keyword = q.trim();
    if (keyword.length === 0) {
      return res.status(400).json({
        message: 'Keyword cannot be empty',
        success: false,
      });
    }

    if (keyword.length > 100) {
      return res.status(400).json({
        message: 'Keyword is too long (max 100 characters)',
        success: false,
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchPattern = `%${keyword}%`;

    const searchCondition = {
      [Op.or]: [
        { name: { [Op.like]: searchPattern } },
        { code: { [Op.like]: searchPattern } },
        { description: { [Op.like]: searchPattern } },
      ],
    };

    const [majors, faculties, posts, events] = await Promise.all([
      Major.findAndCountAll({
        where: searchCondition,
        include: [{ model: Faculty, attributes: ['id', 'name'] }],
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'code', 'description'],
        raw: false,
      }),
      Faculty.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: searchPattern } },
            { introduction: { [Op.like]: searchPattern } },
          ],
        },
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']],
        attributes: ['id', 'name', 'introduction'],
        raw: false,
      }),
      Post.findAndCountAll({
        where: {
          status: 'published',
          [Op.or]: [
            { title: { [Op.like]: searchPattern } },
            { excerpt: { [Op.like]: searchPattern } },
            { content: { [Op.like]: searchPattern } },
          ],
        },
        limit: parseInt(limit),
        offset,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'slug', 'excerpt', 'createdAt'],
        raw: false,
      }),
      Event.findAndCountAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: searchPattern } },
            { description: { [Op.like]: searchPattern } },
          ],
        },
        limit: parseInt(limit),
        offset,
        order: [['event_date', 'DESC']],
        attributes: ['id', 'title', 'description', 'event_date'],
        raw: false,
      }),
    ]);

    const totalResults = majors.count + faculties.count + posts.count + events.count;
    const totalPages = Math.ceil(totalResults / limit);

    const results = {
      majors: majors.rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        faculty: row.Faculty?.name,
        type: 'major',
      })),
      faculties: faculties.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.introduction,
        type: 'faculty',
      })),
      posts: posts.rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        type: 'post',
        createdAt: row.createdAt,
      })),
      events: events.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        type: 'event',
        date: row.event_date,
      })),
    };

    res.json({
      success: true,
      keyword,
      page: parseInt(page),
      limit: parseInt(limit),
      totalResults,
      totalPages,
      results,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      message: 'An error occurred during search',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const searchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    // Validate input
    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        suggestions: [],
        message: 'Keyword is required',
      });
    }

    const keyword = q.trim();
    if (keyword.length < 2) {
      return res.json({
        success: true,
        suggestions: [],
        message: 'Keyword too short',
      });
    }

    if (keyword.length > 50) {
      return res.json({
        success: true,
        suggestions: [],
        message: 'Keyword too long',
      });
    }

    const searchPattern = `%${keyword}%`;
    const maxLimit = Math.min(parseInt(limit) || 10, 20);

    const [majors, faculties, posts, events] = await Promise.all([
      Major.findAll({
        where: { name: { [Op.like]: searchPattern } },
        attributes: ['id', 'name'],
        limit: maxLimit,
        order: [['name', 'ASC']],
        raw: true,
      }),
      Faculty.findAll({
        where: { name: { [Op.like]: searchPattern } },
        attributes: ['id', 'name'],
        limit: maxLimit,
        order: [['name', 'ASC']],
        raw: true,
      }),
      Post.findAll({
        where: {
          status: 'published',
          title: { [Op.like]: searchPattern },
        },
        attributes: ['id', 'title', 'slug'],
        limit: maxLimit,
        order: [['createdAt', 'DESC']],
        raw: true,
      }),
      Event.findAll({
        where: { title: { [Op.like]: searchPattern } },
        attributes: ['id', 'title'],
        limit: maxLimit,
        order: [['event_date', 'DESC']],
        raw: true,
      }),
    ]);

    const suggestions = [
      ...majors.map((m) => ({
        id: m.id,
        text: m.name,
        type: 'major',
        href: `/nganh-dao-tao/${m.id}`,
      })),
      ...faculties.map((f) => ({
        id: f.id,
        text: f.name,
        type: 'faculty',
        href: `/khoa/${f.id}`,
      })),
      ...posts.map((p) => ({
        id: p.id,
        text: p.title,
        type: 'post',
        href: `/tin-tuc/${p.slug}`,
      })),
      ...events.map((e) => ({
        id: e.id,
        text: e.title,
        type: 'event',
      })),
    ].slice(0, maxLimit);

    res.json({
      success: true,
      keyword,
      suggestions,
    });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      suggestions: [],
      message: 'An error occurred while fetching suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  globalSearch,
  searchSuggestions,
};
