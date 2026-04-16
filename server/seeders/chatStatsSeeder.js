const { sequelize, ChatSession, ChatMessage } = require('../models');

const seedChatStats = async () => {
  try {
    console.log('--- Đang xoá dữ liệu cũ (tuỳ chọn)...');
    // Nếu muốn xoá sạch trước khi seed
    // await ChatMessage.destroy({ where: {}, truncate: true });
    // await ChatSession.destroy({ where: {}, truncate: true });

    const schools = [
      'THPT Chuyên Lê Quý Đôn',
      'THPT Phan Châu Trinh',
      'THPT Hòa Vang',
      'THPT Thái Phiên',
      'THPT Trần Phú',
      'THPT Nguyễn Hiền',
      'THPT Ngô Quyền'
    ];

    const majors = [
      'Quản trị kinh doanh',
      'Kế toán',
      'Công nghệ thông tin',
      'Marketing',
      'Kinh doanh quốc tế',
      'Kinh tế lực lượng vũ trang',
      'Thương mại điện tử'
    ];

    const userQuestions = [
      'Học phí ngành CNTT là bao nhiêu?',
      'Điểm chuẩn năm ngoái ngành Marketing?',
      'Trường có học bổng không?',
      'Ngành Kế toán học những gì?',
      'Thời gian xét tuyển đợt 1?',
      'Ký túc xá của trường ở đâu?',
      'Cơ hội việc làm sau khi tốt nghiệp?'
    ];

    const today = new Date();

    console.log('--- Đang tạo dữ liệu ChatSession & ChatMessage...');

    for (let i = 0; i < 50; i++) {
        // Tạo ngày ngẫu nhiên trong 10 ngày qua
        const randomDays = Math.floor(Math.random() * 10);
        const createdAt = new Date(today);
        createdAt.setDate(today.getDate() - randomDays);

        const session = await ChatSession.create({
            visitor_name: `User ${i}`,
            visitor_email: `user${i}@example.com`,
            visitor_phone: '0901234567',
            visitor_school: schools[Math.floor(Math.random() * schools.length)],
            createdAt: createdAt,
            updatedAt: createdAt
        });

        // Tạo 1-3 tin nhắn cho mỗi phiên
        const msgType = Math.random();
        
        // 1. User question
        const question = userQuestions[Math.floor(Math.random() * userQuestions.length)];
        await ChatMessage.create({
            session_id: session.id,
            role: 'user',
            content: question,
            createdAt: createdAt,
            updatedAt: createdAt
        });

        // 2. Assistant response containing Major Card (metadata)
        if (msgType > 0.3) {
            const majorName = majors[Math.floor(Math.random() * majors.length)];
            await ChatMessage.create({
                session_id: session.id,
                role: 'assistant',
                content: `Đây là thông tin về ngành ${majorName}`,
                metadata: {
                    data: {
                        name: majorName
                    }
                },
                createdAt: createdAt,
                updatedAt: createdAt
            });
        }
    }

    console.log('--- Seed dữ liệu thống kê Chat thành công!');
    process.exit(0);
  } catch (error) {
    console.error('--- Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedChatStats();
