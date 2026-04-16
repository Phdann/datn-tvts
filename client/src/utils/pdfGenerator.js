import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { LiberationSansRegularBase64 } from './LiberationSans-Regular-normal.js';

export const generateApplicationPDF = (application) => {
    const doc = new jsPDF();

    // Add Unicode Font for Vietnamese Support
    doc.addFileToVFS("LiberationSans-Regular.ttf", LiberationSansRegularBase64);
    doc.addFont("LiberationSans-Regular.ttf", "LiberationSans", "normal");
    doc.setFont("LiberationSans");

    // Administrative layout (B&W)
    doc.setFontSize(16);
    doc.text('PHIẾU ĐĂNG KÝ XÉT TUYỂN', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Mã hồ sơ: #' + application.id, 20, 35);
    doc.text('Ngày nộp: ' + new Date(application.createdAt).toLocaleDateString('vi-VN'), 160, 35);
    
    doc.line(20, 40, 190, 40);

    // Candidate Info
    doc.setFontSize(12);
    doc.text('1. THÔNG TIN THÍ SINH', 20, 50);
    
    const candidateData = [
        ['Họ và tên:', application.Candidate?.name || '—'],
        ['Email:', application.Candidate?.email || '—'],
        ['Số điện thoại:', application.Candidate?.phone || '—'],
        ['Điểm học bạ:', application.Candidate?.high_school_score || '—']
    ];

    doc.autoTable({
        startY: 55,
        body: candidateData,
        theme: 'plain',
        styles: { font: 'LiberationSans', fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'normal', width: 40 } }
    });

    // Application Details
    const currentY = doc.lastAutoTable.finalY + 10;
    doc.text('2. CHI TIẾT ĐĂNG KÝ', 20, currentY);

    const applicationData = [
        ['Ngành xét tuyển:', application.Major?.name || '—'],
        ['Mã ngành:', application.Major?.code || '—'],
        ['Phương thức:', application.AdmissionMethod?.name || '—'],
        ['Trạng thái:', application.status || '—']
    ];

    doc.autoTable({
        startY: currentY + 5,
        body: applicationData,
        theme: 'grid',
        styles: { font: 'LiberationSans', fontSize: 10, cellPadding: 3, lineColor: [200, 200, 200] },
        columnStyles: { 0: { fontStyle: 'normal', fillColor: [245, 245, 245], width: 40 } }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('Người lập phiếu', 150, finalY, { align: 'center' });
    doc.text('(Ký và ghi rõ họ tên)', 150, finalY + 5, { align: 'center' });

    doc.save(`Ho_so_${application.id}.pdf`);
};

export const exportApplicationsPDF = (applications, universityName = 'TRƯỜNG ĐẠI HỌC KINH TẾ') => {
    const doc = new jsPDF();

    doc.addFileToVFS("LiberationSans-Regular.ttf", LiberationSansRegularBase64);
    doc.addFont("LiberationSans-Regular.ttf", "LiberationSans", "normal");
    doc.setFont("LiberationSans");

    doc.setFontSize(14);
    doc.text(universityName, 105, 15, { align: 'center' });
    doc.setFontSize(16);
    doc.text('DANH SÁCH HỒ SƠ ĐĂNG KÝ XÉT TUYỂN', 105, 25, { align: 'center' });
    
    const tableData = applications.map(app => [
        app.id,
        app.Candidate?.name || '—',
        app.Major?.name || '—',
        app.status,
        app.Candidate?.high_school_score || '—',
        new Date(app.createdAt).toLocaleDateString('vi-VN')
    ]);

    doc.autoTable({
        startY: 35,
        head: [['Mã', 'Thí sinh', 'Ngành học', 'Trạng thái', 'Điểm', 'Ngày nộp']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] },
        styles: { font: 'LiberationSans', fontSize: 9 }
    });

    doc.save('Danh_sach_ho_so.pdf');
};
