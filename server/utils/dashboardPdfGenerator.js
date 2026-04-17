const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

// Path to the font file in the assets directory
const localFontPath = path.join(__dirname, '..', 'assets', 'fonts', 'LiberationSans-Regular.ttf');

const resolveFont = () => {
    // Priority: 1. Local project font, 2. Windows Arial, 3. Windows Tahoma, 4. Standard Helvetica
    if (fs.existsSync(localFontPath)) {
        return { name: 'LiberationSans', path: localFontPath };
    }
    
    const systemFonts = [
        { name: 'Arial', path: 'C:\\Windows\\Fonts\\arial.ttf' },
        { name: 'Tahoma', path: 'C:\\Windows\\Fonts\\tahoma.ttf' }
    ];

    const match = systemFonts.find((font) => fs.existsSync(font.path));
    return match || { name: 'Helvetica', path: null };
};

/**
 * Generates a Dashboard Report PDF
 * @param {Object} data - Data to include in the report
 * @returns {Promise<Buffer>} - The generated PDF buffer
 */
const generateDashboardPDF = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const selectedFont = resolveFont();
            
            const doc = new PDFDocument({
                margin: 30,
                size: 'A4',
                bufferPages: true,
            });
            
            // Register and set font globally if path exists
            if (selectedFont.path) {
                doc.registerFont(selectedFont.name, selectedFont.path);
                doc.font(selectedFont.name);
            }

            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const applyFont = () => doc.font(selectedFont.name);
            const applyBodyText = () => applyFont().fontSize(10).fillColor('#334155');
            const applyHeaderText = () => applyFont().fontSize(10).fillColor('#0f172a');

            const safeText = (value, fallback = 'N/A') => {
                if (value === null || value === undefined) return fallback;
                const normalized = String(value).trim();
                return normalized || fallback;
            };

            const getCountValue = (record) => {
                if (!record) return '0';
                const rawCount = record.count ?? (record.getDataValue ? record.getDataValue('count') : 0);
                return String(rawCount || 0);
            };

            const timestamp = new Date().toLocaleString('vi-VN');

            // --- PDF CONTENT START ---

            // Header
            applyFont().fontSize(22).fillColor('#0f172a').text('BÁO CÁO TỔNG QUAN HỆ THỐNG', { align: 'center' });
            doc.moveDown(0.5);

            applyFont().fontSize(10).fillColor('#64748b').text(`Ngày xuất báo cáo: ${timestamp}`, { align: 'center' });
            doc.moveDown(1);

            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(30, doc.y).lineTo(565, doc.y).stroke();
            doc.moveDown(1.5);

            // 1. Overview Section
            applyFont().fontSize(16).fillColor('#1e293b').text('1. Số liệu tổng quan', { underline: true });
            doc.moveDown(0.8);

            const overviewTable = {
                headers: ['Tiêu chí', 'Giá trị'],
                rows: [
                    ['Ngành đào tạo', String(data.counts?.majors || 0)],
                    ['Quản trị viên', String(data.counts?.users || 0)],
                    ['Phiên Chat AI', String(data.counts?.chat_sessions || 0)],
                    ['Nguồn trường THPT', String(data.schools?.length || 0)],
                ],
            };

            doc.table(overviewTable, {
                prepareHeader: () => applyHeaderText().fontSize(11).font(selectedFont.name + '-Bold' || selectedFont.name),
                prepareRow: () => applyBodyText(),
                columnSpacing: 10,
                padding: 5,
                columnsSize: [300, 200],
                headerColor: '#f1f5f9',
            });

            doc.moveDown(2);

            // 2. Popular Majors Section
            applyFont().fontSize(16).fillColor('#1e293b').text('2. Top ngành học được quan tâm', { underline: true });
            doc.moveDown(0.8);

            const majorsTable = {
                headers: ['Tên ngành', 'Lượt quan tâm'],
                rows: (data.majors || []).map((major) => [
                    safeText(major.getDataValue ? major.getDataValue('major_name') : major.major_name, 'Không xác định'),
                    getCountValue(major),
                ]),
            };

            doc.table(majorsTable, {
                prepareHeader: () => applyHeaderText().fontSize(11),
                prepareRow: () => applyBodyText(),
                headerColor: '#f1f5f9',
                columnsSize: [400, 100],
            });

            doc.moveDown(2);

            // 3. Popular Questions Section
            applyFont().fontSize(16).fillColor('#1e293b').text('3. Câu hỏi phổ biến', { underline: true });
            doc.moveDown(0.8);

            const questionsTable = {
                headers: ['Nội dung câu hỏi', 'Lượt hỏi'],
                rows: (data.questions || []).map((question) => [
                    safeText(question.content),
                    getCountValue(question),
                ]),
            };

            doc.table(questionsTable, {
                prepareHeader: () => applyHeaderText().fontSize(11),
                prepareRow: () => applyBodyText(),
                headerColor: '#f1f5f9',
                columnsSize: [420, 80],
            });

            // Footer / Page Numbers
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i += 1) {
                doc.switchToPage(i);
                applyFont().fontSize(8).fillColor('#94a3b8').text(
                    `Trang ${i + 1}/${range.count} - Hệ thống Tư vấn Tuyển sinh TVTS`,
                    0,
                    800,
                    { align: 'center', width: 595 }
                );
            }

            doc.end();
        } catch (err) {
            console.error('PDF Generation Error:', err);
            reject(err);
        }
    });
};

module.exports = { generateDashboardPDF };
