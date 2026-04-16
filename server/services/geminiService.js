const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios'); 
const keyManager = require('../utils/geminiKeyManager');
const { Major, HistoricalScore, AdmissionMethod, Faculty } = require('../models/index');
const { Op } = require('sequelize');

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

class GeminiService {
    constructor() {
        this.model = null;
    }

    buildSystemInstruction(persona = 'student', userInfo = null) {
        const userGreeting = userInfo && userInfo.name 
            ? `Người dùng đang chat tên là: ${userInfo.name}. Số điện thoại: ${userInfo.phone || 'Chưa cung cấp'}. Hãy xưng hô thân mật bằng tên nếu phù hợp.` 
            : 'Bạn chưa biết tên người dùng.';

        const baseInstruction = `Bạn là trợ lý AI tư vấn tuyển sinh của Trường Đại học Kinh tế - Đại học Đà Nẵng (DUE). ${userGreeting}`;

        const personaInstructions = {
            student: `
${baseInstruction}

**GIỌNG ĐIỆU & PHONG CÁCH:**
- Bạn là người anh/chị đi trước (mentor), thân thiện, gần gũi.
- Dùng ngôn ngữ trẻ trung (Gen Z), dễ hiểu, dùng emoji (😊, 🎓, 💡, ✨).
- Xưng hô: "mình" - "bạn" (hoặc tên người dùng).
- Giọng văn thoải mái nhưng vẫn chuyên nghiệp, không sáo rỗng.

**NHIỆM VỤ:**
- Trả lời dựa trên "CONTEXT DỮ LIỆU" được cung cấp bên dưới.
- Nếu thông tin không có trong Context, hãy nói khéo là chưa tìm thấy và gợi ý liên hệ hotline nhà trường, ĐỪNG BỊA ĐẶT.
- Tư vấn về đời sống sinh viên, review ngành học, cơ hội việc làm.
`,
            parent: `
${baseInstruction}

**GIỌNG ĐIỆU & PHONG CÁCH:**
- Bạn là chuyên viên tư vấn tuyển sinh chuyên nghiệp.
- Ngôn ngữ trang trọng, lịch sự, đáng tin cậy.
- Xưng hô: "Tôi" - "Quý phụ huynh/Quý vị" (hoặc gọi tên: Anh/Chị + Tên).
- Giọng văn chính thống, rõ ràng, tập trung vào số liệu và lợi ích.

**NHIỆM VỤ:**
- Trả lời dựa trên "CONTEXT DỮ LIỆU" được cung cấp bên dưới.
- Tập trung vào: Học phí, Cam kết đầu ra, Chất lượng đào tạo, An ninh an toàn.
- Giải đáp kỹ lưỡng, tạo sự an tâm tuyệt đối.
`
        };

        return personaInstructions[persona] || personaInstructions.student;
    }

    async getSmartContext(message) {
        const context = {
            majors: [], // Dùng để tạo UI Card
            scores: [], // Dùng để vẽ biểu đồ
            text: ''    // Dùng để nạp vào prompt cho AI trả lời
        };

        try {
            const allMajors = await Major.findAll({
                include: [
                    { model: Faculty, attributes: ['name'] },
                    { 
                        model: HistoricalScore, 
                        limit: 3,
                        order: [['year', 'DESC']],
                        include: [{ model: AdmissionMethod, attributes: ['name'] }]
                    }
                ]
            });

            const messageLower = message.toLowerCase();

            // 1. SCHOOL STRUCTURE & STATISTICS (Luôn cung cấp cơ bản hoặc cung cấp chi tiết khi được hỏi)
            const allFaculties = await Faculty.findAll({ attributes: ['id', 'name'] });
            const totalMajorsCount = await Major.count();
            
            context.text += `\n=== THÔNG TIN CƠ CẤU TRƯỜNG (DATABASE) ===\n`;
            context.text += `- Tổng số Khoa: ${allFaculties.length}\n`;
            context.text += `- Tổng số Ngành đào tạo: ${totalMajorsCount}\n`;

            if (messageLower.match(/bao nhiêu khoa|danh sách khoa|kể tên khoa|các khoa/i)) {
                context.text += `- Danh sách các Khoa tại trường: ${allFaculties.map(f => f.name).join(', ')}\n`;
            }
            
            if (messageLower.match(/bao nhiêu ngành|danh sách ngành|các ngành/i)) {
                const majorNames = allMajors.slice(0, 15).map(m => m.name).join(', ');
                context.text += `- Một số Ngành đào tạo tiêu biểu: ${majorNames}${allMajors.length > 15 ? '... và nhiều ngành khác' : ''}\n`;
            }

            // 2. DETAILED MAJOR LOOKUP (Nếu nhắc tên ngành cụ thể)
            const foundMajors = allMajors.filter(m => {
                const nameMatch = m.name && messageLower.includes(m.name.toLowerCase());
                const codeMatch = m.code && messageLower.includes(m.code.toLowerCase());
                return nameMatch || codeMatch;
            });

            if (foundMajors.length > 0) {
                context.majors = foundMajors; 
                context.text += '\n=== CHI TIẾT NGÀNH HỌC ĐƯỢC NHẮC ĐẾN (DATABASE) ===\n';
                foundMajors.forEach(major => {
                    context.text += `
📌 Ngành: ${major.name} (Mã: ${major.code})
   - Thuộc khoa: ${major.Faculty?.name || 'N/A'}
   - Học phí: ${new Intl.NumberFormat('vi-VN').format(major.tuition)} VNĐ/năm
   - Chỉ tiêu: ${major.quota} sinh viên
   - Mô tả: ${major.description ? major.description : 'Đang cập nhật'}
`;
                    if (major.HistoricalScores?.length > 0) {
                        context.text += `   - Điểm chuẩn năm gần nhất: `;
                        major.HistoricalScores.forEach(s => {
                            context.text += `${s.year}: ${s.score}đ; `;
                        });
                        context.text += '\n';
                    }
                    context.text += '----------------\n';
                });
            }

            // 3. PYTHON RAG SEARCH (ChromaDB - Tài liệu phi cấu trúc)
            try {
                const ragResponse = await axios.post(`${PYTHON_SERVICE_URL}/search`, {
                    question: message,
                    n_results: 3
                });
                
                if (ragResponse.data.context && ragResponse.data.context.length > 0) {
                    context.text += `\n=== KIẾN THỨC TỪ TÀI LIỆU TUYỂN SINH (KNOWLEDGE BASE) ===\n`;
                    ragResponse.data.context.forEach((item, index) => {
                        context.text += `[Tài liệu ${index + 1} - Nguồn: ${item.source}]: ${item.content}\n---\n`;
                    });
                }
            } catch (err) {
                console.warn(" Warning: Không thể kết nối tới Python Vector Service.");
            }

            // 4. HISTORICAL SCORES DATA (Cho biểu đồ hoặc so sánh)
            if (message.match(/điểm chuẩn|điểm|trúng tuyển|so sánh|biểu đồ/i)) {
                let whereCondition = {};
                if (foundMajors.length > 0) {
                    whereCondition = { major_id: foundMajors.map(m => m.id) };
                }

                const recentScores = await HistoricalScore.findAll({
                    where: whereCondition,
                    include: [
                        { model: Major, attributes: ['name', 'code'] },
                        { model: AdmissionMethod, attributes: ['name'] }
                    ],
                    order: [['year', 'DESC']],
                    limit: 10 
                });
                
                if (recentScores.length > 0) context.scores = recentScores;
            }

        } catch (error) {
            console.error('Error fetching smart context:', error);
        }

        return context;
    }

  
    async generateResponse(message, persona = 'student', sessionHistory = [], userInfo = null) {
        let lastError = null;
        const maxRetries = 3;
        const initialDelay = 1000; // 1 second

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const apiKey = keyManager.getNextKey();
                if (!apiKey) throw new Error('No Gemini API key available');

                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ 
                    model: 'gemini-3-flash-preview', 
                    systemInstruction: this.buildSystemInstruction(persona, userInfo)
                });

                const context = await this.getSmartContext(message);

                let historyText = '';
                if (sessionHistory.length > 0) {
                    historyText = '\n**LỊCH SỬ HỘI THOẠI TRƯỚC ĐÓ:**\n';
                    sessionHistory.slice(-5).forEach(msg => {
                        historyText += `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}\n`;
                    });
                }

                const finalPrompt = `
${context.text}

${historyText}

**CÂU HỎI MỚI CỦA NGƯỜI DÙNG:**
"${message}"

Hãy trả lời câu hỏi trên. Ưu tiên sử dụng thông tin trong phần "THÔNG TIN TRA CỨU" và "DATABASE".
Nếu có thông tin về ngành học cụ thể trong Database, hãy nhắc người dùng xem thẻ thông tin bên dưới.
`;

                const result = await model.generateContent(finalPrompt);
                const reply = result.response.text();

                const response = {
                    reply: reply,
                    sessionId: null, 
                    related_data: null
                };

                if (context.majors.length > 0) {
                    const topMajor = context.majors[0];
                    response.related_data = {
                        type: 'major_card',
                        data: {
                            id: topMajor.id,
                            name: topMajor.name,
                            code: topMajor.code,
                            tuition: topMajor.tuition,
                            quota: topMajor.quota,
                            faculty: topMajor.Faculty?.name
                        }
                    };
                }

                if (context.scores.length > 0 && message.match(/biểu đồ|chart|xu hướng|so sánh/i)) {
                    response.related_data = {
                        type: 'chart',
                        data: {
                            title: 'Điểm chuẩn các năm gần đây',
                            scores: context.scores.map(s => ({
                                year: s.year,
                                score: s.threshold_score,
                                major: s.Major?.name,
                                method: s.AdmissionMethod?.name
                            }))
                        }
                    };
                }

                return response;

            } catch (error) {
                lastError = error;
                console.error(`Gemini generation error (Attempt ${attempt}/${maxRetries}):`, error.message);

                // If it's a 503 error (Service Unavailable), wait and retry
                if (error.status === 503 && attempt < maxRetries) {
                    const delay = initialDelay * Math.pow(2, attempt - 1);
                    console.log(`Model busy, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // For other errors or if we've exhausted retries, break and return the error response
                break;
            }
        }

        return {
            reply: "Xin lỗi, hiện tại hệ thống đang quá tải hoặc gặp sự cố kết nối. Bạn vui lòng thử lại sau giây lát nhé! 😓",
            related_data: null,
            error: lastError?.message
        };
    }
}

module.exports = new GeminiService();