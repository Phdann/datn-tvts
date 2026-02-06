const axios = require('axios');
const { ChatKnowledgeBase } = require('../models'); 
const PYTHON_SERVICE_URL = 'http://localhost:8000';

const ingestData = async (req, res) => {
    try {
        const { title, content, content_type, admission_year, major, keywords, source, status } = req.body;

        const newRecord = await ChatKnowledgeBase.create({
            title,
            content, // Lưu nội dung thô
            content_type,
            admission_year,
            major,
            keywords,
            source,
            status: status || 'active'
        });

        //GỬI SANG PYTHON (Chỉ gửi nếu status là active)
        if (newRecord.status === 'active') {
            try {
                // Gọi Python để Vector hóa (AI học)
                await axios.post(`${PYTHON_SERVICE_URL}/ingest-text`, {
                    source: `${title} [ID:${newRecord.id}]`, // Gắn ID vào source để sau này dễ tìm/xóa
                    content: content 
                });
            } catch (pythonError) {
                console.error("Lỗi bên Python:", pythonError.message);
            }
        }

        res.json({ 
            message: 'Đã lưu dữ liệu thành công!', 
            data: newRecord 
        });

    } catch (error) {
        console.error('Lỗi nạp dữ liệu:', error);
        res.status(500).json({ message: 'Lỗi server khi lưu dữ liệu' });
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

        // A. Tìm bản ghi cũ trong MySQL
        const oldRecord = await ChatKnowledgeBase.findByPk(id);
        if (!oldRecord) return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });

        // B. Lưu cái tên nguồn cũ (để bảo Python xóa nó đi)
        const oldSourceIdentifier = `${oldRecord.title} [ID:${oldRecord.id}]`;

        // C. Cập nhật MySQL
        await oldRecord.update({
            title, content, content_type, admission_year, major, keywords, source, status
        });

        // D. ĐỒNG BỘ SANG PYTHON
        try {
            // Bước D1: Gọi Python XÓA kiến thức cũ
            await axios.post(`${PYTHON_SERVICE_URL}/delete-doc`, {
                source: oldSourceIdentifier
            });

            // Bước D2: Nếu trạng thái là Active, thì NẠP kiến thức mới
            if (status === 'active') {
                const newSourceIdentifier = `${title} [ID:${id}]`; // Tạo tên nguồn mới
                
              
                const enrichedContent = `
=== METADATA ===
Tiêu đề: ${title}
Năm: ${admission_year}
Loại: ${content_type}
Ngành: ${major || 'Chung'}
Từ khóa: ${keywords}
================
${content}
                `.trim();

                await axios.post(`${PYTHON_SERVICE_URL}/ingest-text`, {
                    source: newSourceIdentifier,
                    content: enrichedContent
                });
            }
        } catch (pyError) {
            console.error("Lỗi đồng bộ Python:", pyError.message);
        }

        res.json({ message: 'Cập nhật thành công và đã đồng bộ AI!' });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const deleteKnowledge = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await ChatKnowledgeBase.findByPk(id);
        
        if (record) {
            // Gọi Python xóa vector trước
            const sourceIdentifier = `${record.title} [ID:${record.id}]`;
            try {
                await axios.post(`${PYTHON_SERVICE_URL}/delete-doc`, { source: sourceIdentifier });
            } catch (e) { console.error("Lỗi xóa vector Python:", e.message); }

            // Xóa trong MySQL
            await record.destroy();
        }
        res.json({ message: 'Đã xóa hoàn toàn' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { ingestData, getAllKnowledge, updateKnowledge, deleteKnowledge };