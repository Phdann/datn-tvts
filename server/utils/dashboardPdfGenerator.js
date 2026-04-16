const PDFDocument = require('pdfkit-table');
const path = require('path');
const fs = require('fs');

const FONT_CANDIDATES = [
    { name: 'Arial', path: 'C:\\Windows\\Fonts\\arial.ttf' },
    { name: 'Tahoma', path: 'C:\\Windows\\Fonts\\tahoma.ttf' },
    { name: 'Calibri', path: 'C:\\Windows\\Fonts\\calibri.ttf' },
    { name: 'LiberationSans', path: path.join(__dirname, '..', 'assets', 'fonts', 'LiberationSans-Regular.ttf') },
];

const resolveFont = () => {
    const match = FONT_CANDIDATES.find((font) => fs.existsSync(font.path));
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
            const doc = new PDFDocument({
                margin: 30,
                size: 'A4',
                bufferPages: true,
            });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const selectedFont = resolveFont();
            if (selectedFont.path) {
                doc.registerFont(selectedFont.name, selectedFont.path);
            } else {
                console.warn('No Unicode font found for dashboard PDF export. Falling back to Helvetica.');
            }

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

            applyFont();
            doc.fontSize(22).fillColor('#0f172a').text('\u0042\u00c1\u004f\u0020\u0043\u00c1\u004f\u0020\u0054\u1ed4\u004e\u0047\u0020\u0051\u0055\u0041\u004e\u0020\u0048\u1ec6\u0020\u0054\u0048\u1ed0\u004e\u0047', { align: 'center' });
            doc.moveDown(0.5);

            applyFont();
            doc.fontSize(10).fillColor('#64748b').text(`\u004e\u0067\u00e0\u0079\u0020\u0078\u0075\u1ea5\u0074\u0020\u0062\u00e1\u006f\u0020\u0063\u00e1\u006f\u003a ${timestamp}`, { align: 'center' });
            doc.moveDown(1);

            doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(30, doc.y).lineTo(565, doc.y).stroke();
            doc.moveDown(1.5);

            applyFont();
            doc.fontSize(16).fillColor('#1e293b').text('1. \u0053\u1ed1\u0020\u006c\u0069\u1ec7\u0075\u0020\u0074\u1ed5\u006e\u0067\u0020\u0071\u0075\u0061\u006e', { underline: true });
            doc.moveDown(0.8);

            const overviewTable = {
                title: '',
                headers: ['\u0054\u0069\u00ea\u0075\u0020\u0063\u0068\u00ed', '\u0047\u0069\u00e1\u0020\u0074\u0072\u1ecb'],
                rows: [
                    ['\u004e\u0067\u00e0\u006e\u0068\u0020\u0111\u00e0\u006f\u0020\u0074\u1ea1\u006f', String(data.counts?.majors || 0)],
                    ['\u0051\u0075\u1ea3\u006e\u0020\u0074\u0072\u1ecb\u0020\u0076\u0069\u00ea\u006e', String(data.counts?.users || 0)],
                    ['\u0050\u0068\u0069\u00ea\u006e\u0020\u0043\u0068\u0061\u0074\u0020\u0041\u0049', String(data.counts?.chat_sessions || 0)],
                    ['\u004e\u0067\u0075\u1ed3\u006e\u0020\u0074\u0072\u01b0\u1edd\u006e\u0067\u0020\u0054\u0048\u0050\u0054', String(data.schools?.length || 0)],
                ],
            };

            doc.table(overviewTable, {
                prepareHeader: () => applyHeaderText(),
                prepareRow: () => applyBodyText(),
                columnSpacing: 10,
                padding: 5,
                columnsSize: [300, 200],
                headerColor: '#e2e8f0',
            });

            doc.moveDown(2);

            applyFont();
            doc.fontSize(16).fillColor('#1e293b').text('2. \u0054\u006f\u0070\u0020\u006e\u0067\u00e0\u006e\u0068\u0020\u0068\u1ecd\u0063\u0020\u0111\u01b0\u1ee3\u0063\u0020\u0071\u0075\u0061\u006e\u0020\u0074\u00e2\u006d', { underline: true });
            doc.moveDown(0.8);

            const majorsTable = {
                title: '',
                headers: ['\u0054\u00ea\u006e\u0020\u006e\u0067\u00e0\u006e\u0068', '\u004c\u01b0\u1ee3\u0074\u0020\u0071\u0075\u0061\u006e\u0020\u0074\u00e2\u006d'],
                rows: (data.majors || []).map((major) => [
                    safeText(major.getDataValue ? major.getDataValue('major_name') : major.major_name, '\u004b\u0068\u00f4\u006e\u0067\u0020\u0078\u00e1\u0063\u0020\u0111\u1ecb\u006e\u0068'),
                    getCountValue(major),
                ]),
            };

            doc.table(majorsTable, {
                prepareHeader: () => applyHeaderText(),
                prepareRow: () => applyBodyText(),
                headerColor: '#e2e8f0',
                columnsSize: [400, 100],
            });

            doc.moveDown(2);

            applyFont();
            doc.fontSize(16).fillColor('#1e293b').text('3. \u0043\u00e2\u0075\u0020\u0068\u1ecf\u0069\u0020\u0070\u0068\u1ed5\u0020\u0062\u0069\u1ebf\u006e', { underline: true });
            doc.moveDown(0.8);

            const questionsTable = {
                title: '',
                headers: ['\u004e\u1ed9\u0069\u0020\u0064\u0075\u006e\u0067\u0020\u0063\u00e2\u0075\u0020\u0068\u1ecf\u0069', '\u004c\u01b0\u1ee3\u0074\u0020\u0068\u1ecf\u0069'],
                rows: (data.questions || []).map((question) => [
                    safeText(question.content),
                    getCountValue(question),
                ]),
            };

            doc.table(questionsTable, {
                prepareHeader: () => applyHeaderText(),
                prepareRow: () => applyBodyText(),
                headerColor: '#e2e8f0',
                columnsSize: [420, 80],
            });

            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i += 1) {
                doc.switchToPage(i);
                applyFont();
                doc.fontSize(8).fillColor('#94a3b8').text(
                    `\u0054\u0072\u0061\u006e\u0067 ${i + 1}/${range.count} - \u0048\u1ec7\u0020\u0074\u0068\u1ed1\u006e\u0067\u0020\u0054\u01b0\u0020\u0076\u1ea5\u006e\u0020\u0054\u0075\u0079\u1ec3\u006e\u0020\u0073\u0069\u006e\u0068\u0020\u0054\u0056\u0054\u0053`,
                    0,
                    800,
                    { align: 'center', width: 595 }
                );
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateDashboardPDF };
