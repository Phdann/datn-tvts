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
            const foundMajors = allMajors.filter(m => {
                const nameMatch = m.name && messageLower.includes(m.name.toLowerCase());
                const codeMatch = m.code && messageLower.includes(m.code.toLowerCase());
                return nameMatch || codeMatch;
            });

            // Nếu tìm thấy ngành, tạo Context chi tiết và gắn Thẻ UI
            if (foundMajors.length > 0) {
                context.majors = foundMajors; 
                
                context.text += '\n=== THÔNG TIN NGÀNH HỌC TỪ DATABASE (CHÍNH XÁC) ===\n';
                foundMajors.forEach(major => {
                    context.text += `
📌 Tên ngành: ${major.name} (Mã: ${major.code})
   - Khoa quản lý: ${major.Faculty?.name || 'N/A'}
   - Học phí: ${new Intl.NumberFormat('vi-VN').format(major.tuition)} VNĐ/năm
   - Chỉ tiêu tuyển sinh: ${major.quota} sinh viên
   - Mô tả ngắn: ${major.description ? major.description.substring(0, 150) + '...' : 'Đang cập nhật'}
`;
                    if (major.HistoricalScores?.length > 0) {
                        context.text += `   - Điểm chuẩn các năm trước: `;
                        major.HistoricalScores.forEach(s => {
                            context.text += `Năm ${s.year} (${s.AdmissionMethod?.name}): ${s.threshold_score} điểm; `;
                        });
                        context.text += '\n';
                    }
                    context.text += '----------------\n';
                });
            }
            try {
                const ragResponse = await axios.post(`${PYTHON_SERVICE_URL}/search`, {
                    question: message,
                    n_results: 3
                });
                
                if (ragResponse.data.context && ragResponse.data.context.length > 0) {
                    const vectorText = ragResponse.data.context.join("\n\n---\n\n");
                    context.text += `\n=== KIẾN THỨC BỔ SUNG TỪ KNOWLEDGE BASE ===\n${vectorText}\n`;
                }
            } catch (err) {
                console.warn("⚠️ Warning: Không thể kết nối tới Python Vector Service. Bỏ qua bước RAG.");
            }

            if (message.match(/điểm chuẩn|điểm|trúng tuyển|so sánh/i)) {
                // Nếu đã tìm thấy ngành cụ thể ở Bước 1, chỉ lấy điểm của ngành đó thôi cho đỡ nhiễu
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
        try {
            const apiKey = keyManager.getNextKey();
            if (!apiKey) throw new Error('No Gemini API key available');

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ 
                model: 'gemini-2.5-flash', 
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
            console.error('Gemini generation error:', error);
            return {
                reply: "Xin lỗi, hiện tại hệ thống đang quá tải hoặc gặp sự cố kết nối. Bạn vui lòng thử lại sau giây lát nhé! 😓",
                related_data: null
            };
        }
    }
}

module.exports = new GeminiService();