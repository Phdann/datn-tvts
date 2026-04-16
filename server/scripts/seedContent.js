const { Major, Specialization } = require('../models');

const majorDescriptions = {
  'Khoa học Máy tính': 'Chương trình đào tạo Khoa học Máy tính cung cấp kiến thức nền tảng vững chắc về thuật toán, cấu trúc dữ liệu, trí tuệ nhân tạo và khoa học dữ liệu. Sinh viên được trang bị tư duy giải quyết vấn đề phức tạp và khả năng nghiên cứu, phát triển các công nghệ mới đột phá.',
  'Công nghệ thông tin': 'Chương trình đào tạo kỹ sư Công nghệ thông tin trang bị cho sinh viên kiến thức nền tảng và chuyên sâu về phát triển phần mềm, hệ thống mạng, an toàn thông tin và trí tuệ nhân tạo. Sinh viên được thực hành với các công nghệ mới nhất, tham gia các dự án thực tế và có cơ hội việc làm rộng mở tại các tập đoàn công nghệ hàng đầu.',
  'Kế toán': 'Đào tạo các chuyên gia kế toán có khả năng thực hiện nghiệp vụ kiểm toán, phân tích tài chính và quản trị rủi ro trong doanh nghiệp. Chương trình kết hợp giữa lý thuyết và thực tiễn, giúp sinh viên nắm vững các quy định về chuẩn mực kế toán và thuế tại Việt Nam cũng như quốc tế.',
  'Quản trị kinh doanh': 'Cung cấp tầm nhìn chiến lược và kỹ năng quản lý hiện đại. Sinh viên được học về marketing, nhân sự, tài chính và khởi nghiệp, chuẩn bị cho các vị trí lãnh đạo trong môi trường kinh doanh toàn cầu năng động.',
  'Kỹ thuật Phần mềm': 'Tập trung vào quy trình xây dựng, phát triển và bảo trì các hệ thống phần mềm quy mô lớn. Sinh viên được đào tạo bài bản về tư duy logic, cấu trúc dữ liệu, thuật toán và các mô hình quản lý dự án Agile/Scrum.',
  'Kinh tế': 'Trang bị kiến thức về kinh tế học vĩ mô, vi mô, phân tích dữ liệu và tư duy phản biện. Sinh viên có khả năng phân tích xu hướng thị trường, tham vấn chính sách và làm việc trong các tổ chức tài chính, ngân hàng.',
};

const specDescriptions = {
  'Hệ thống thông tin': 'Tập trung vào việc thiết kế, xây dựng và quản trị các hệ thống thông tin cho doanh nghiệp, bao gồm cơ sở dữ liệu và các ứng dụng web.',
  'Mạng máy tính và truyền thông': 'Chuyên sâu về quản trị mạng, an ninh mạng, điện toán đám mây và các giao thức truyền thông hiện đại.',
  'Trí tuệ nhân tạo': 'Nghiên cứu về máy học, xử lý ngôn ngữ tự nhiên, thị giác máy tính và các hệ thống hỗ trợ ra quyết định thông minh.',
  'Kiểm toán': 'Hướng phát triển kỹ năng kiểm soát nội bộ, kiểm toán độc lập và đánh giá báo cáo tài chính theo chuẩn mực chuyên nghiệp.',
  'Kế toán doanh nghiệp': 'Chuyên sâu vào các phần hành kế toán thực tế tại doanh nghiệp, sử dụng thành thạo các phần mềm kế toán phổ biến.',
  'Marketing': 'Nghiên cứu hành vi người dùng, truyền thông đa phương tiện, quản trị thương hiệu và marketing kỹ thuật số (Digital Marketing).',
  'Tài chính doanh nghiệp': 'Quản lý dòng tiền, đầu tư tài chính, phân tích rủi ro và các công cụ phái sinh trong quản trị doanh nghiệp.',
};

async function seedContent() {
  try {
    console.log('--- Đang bắt đầu seed dữ liệu mô tả ---');

    // 1. Seed Majors
    const majors = await Major.findAll();
    let majorCount = 0;
    for (const major of majors) {
      const currentDesc = major.description ? String(major.description).trim() : '';
      if (currentDesc === '' || currentDesc === 'null') {
        const sampleDesc = Object.entries(majorDescriptions).find(([name]) => 
          major.name.toLowerCase().includes(name.toLowerCase())
        );
        
        if (sampleDesc) {
          await major.update({ description: sampleDesc[1] });
          console.log(`+ Đã cập nhật mô tả cho Ngành: ${major.name}`);
          majorCount++;
        }
      }
    }

    // 2. Seed Specializations
    const specs = await Specialization.findAll();
    let specCount = 0;
    for (const spec of specs) {
      const currentDesc = spec.description ? String(spec.description).trim() : '';
      if (currentDesc === '' || currentDesc === 'null') {
        const sampleDesc = Object.entries(specDescriptions).find(([name]) => 
          spec.name.toLowerCase().includes(name.toLowerCase())
        );

        if (sampleDesc) {
          await spec.update({ description: sampleDesc[1] });
          console.log(`+ Đã cập nhật mô tả cho Chuyên ngành: ${spec.name}`);
          specCount++;
        }
      }
    }

    console.log(`--- Seed hoàn tất! ---`);
    console.log(`+ Cập nhật ${majorCount} ngành`);
    console.log(`+ Cập nhật ${specCount} chuyên ngành`);
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
}

seedContent();
