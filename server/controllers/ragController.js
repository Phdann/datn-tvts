const axios = require('axios');
const { ChatKnowledgeBase } = require('../models');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

const normalizeKnowledgeValue = (value) => {
    if (value === null || value === undefined) return '';
    return String(value).normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
};

const buildDuplicateKey = ({ title, source, admission_year, major, content_type }) => {
    const normalizedSource = normalizeKnowledgeValue(source);

    if (normalizedSource) {
        return {
            type: 'source',
            source: normalizedSource
        };
    }

    return {
        type: 'composite',
        title: normalizeKnowledgeValue(title),
        admission_year: admission_year ?? null,
        major: normalizeKnowledgeValue(major) || null,
        content_type: normalizeKnowledgeValue(content_type) || null
    };
};

const isSameDuplicateKey = (left, right) => {
    if (left.type !== right.type) return false;

    if (left.type === 'source') {
        return left.source === right.source;
    }

    return (
        left.title === right.title &&
        left.admission_year === right.admission_year &&
        left.major === right.major &&
        left.content_type === right.content_type
    );
};

const findDuplicateKnowledge = async (payload, excludeId = null) => {
    const records = await ChatKnowledgeBase.findAll({
        attributes: ['id', 'title', 'source', 'admission_year', 'major', 'content_type']
    });

    const targetKey = buildDuplicateKey(payload);

    return records.find((record) => {
        if (excludeId && Number(record.id) === Number(excludeId)) {
            return false;
        }

        return isSameDuplicateKey(targetKey, buildDuplicateKey(record));
    });
};

const buildPythonSourceIdentifier = (record) => `${record.title} [ID:${record.id}]`;

const buildEnrichedContent = ({ title, admission_year, content_type, major, keywords, content }) => `
=== METADATA ===
Tieu de: ${title}
Nam: ${admission_year || 'Khong xac dinh'}
Loai: ${content_type || 'Khong xac dinh'}
Nganh: ${major || 'Chung'}
Tu khoa: ${keywords || ''}
================
${content}
`.trim();

const ingestData = async (req, res) => {
    try {
        const { title, content, content_type, admission_year, major, keywords, source, status } = req.body;

        const duplicateRecord = await findDuplicateKnowledge({
            title,
            source,
            admission_year,
            major,
            content_type
        });

        if (duplicateRecord) {
            return res.status(409).json({
                message: 'Nguon du lieu da ton tai. Vui long cap nhat ban ghi cu thay vi nap moi.',
                duplicate_id: duplicateRecord.id
            });
        }

        const newRecord = await ChatKnowledgeBase.create({
            title,
            content,
            content_type,
            admission_year,
            major,
            keywords,
            source,
            status: status || 'active'
        });

        let chunksAdded;
        if (newRecord.status === 'active') {
            try {
                const pyResp = await axios.post(`${PYTHON_SERVICE_URL}/ingest-text`, {
                    source: buildPythonSourceIdentifier(newRecord),
                    content: buildEnrichedContent(newRecord)
                });
                chunksAdded = pyResp.data?.chunks_added;
            } catch (pythonError) {
                console.error('Python ingest error:', pythonError.message);
            }
        }

        res.json({
            message: 'Da luu du lieu thanh cong.',
            data: newRecord,
            chunksAdded
        });
    } catch (error) {
        console.error('Knowledge ingest error:', error);
        res.status(500).json({ message: 'Loi server khi luu du lieu' });
    }
};

const getAllKnowledge = async (req, res) => {
    try {
        const list = await ChatKnowledgeBase.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateKnowledge = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, content_type, admission_year, major, keywords, source, status } = req.body;
        let chunksAdded;

        const oldRecord = await ChatKnowledgeBase.findByPk(id);
        if (!oldRecord) {
            return res.status(404).json({ message: 'Khong tim thay du lieu' });
        }

        const duplicateRecord = await findDuplicateKnowledge({
            title,
            source,
            admission_year,
            major,
            content_type
        }, id);

        if (duplicateRecord) {
            return res.status(409).json({
                message: 'Thong tin trung voi mot nguon du lieu khac trong kho tri thuc.',
                duplicate_id: duplicateRecord.id
            });
        }

        const oldSourceIdentifier = buildPythonSourceIdentifier(oldRecord);

        await oldRecord.update({
            title,
            content,
            content_type,
            admission_year,
            major,
            keywords,
            source,
            status
        });

        try {
            await axios.post(`${PYTHON_SERVICE_URL}/delete-doc`, {
                source: oldSourceIdentifier
            });

            if (oldRecord.status === 'active') {
                const pyResp = await axios.post(`${PYTHON_SERVICE_URL}/ingest-text`, {
                    source: buildPythonSourceIdentifier(oldRecord),
                    content: buildEnrichedContent(oldRecord)
                });
                chunksAdded = pyResp.data?.chunks_added;
            }
        } catch (pyError) {
            console.error('Python sync error:', pyError.message);
        }

        const responseBody = { message: 'Cap nhat thanh cong va da dong bo AI.' };
        if (chunksAdded !== undefined) responseBody.chunksAdded = chunksAdded;

        res.json(responseBody);
    } catch (error) {
        console.error('Knowledge update error:', error);
        res.status(500).json({ message: 'Loi server' });
    }
};

const deleteKnowledge = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await ChatKnowledgeBase.findByPk(id);

        if (record) {
            try {
                await axios.post(`${PYTHON_SERVICE_URL}/delete-doc`, {
                    source: buildPythonSourceIdentifier(record)
                });
            } catch (error) {
                console.error('Python delete error:', error.message);
            }

            await record.destroy();
        }

        res.json({ message: 'Da xoa hoan toan' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { ingestData, getAllKnowledge, updateKnowledge, deleteKnowledge };
