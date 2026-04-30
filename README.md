# Báo cáo tốt nghiệp: Ứng dụng Trí tuệ nhân tạo trong việc xây dựng Hệ thống Tư vấn tuyển sinh cho trường Đại học Kinh tế - Đại học Đà Nẵng

**Ngành:** Hệ thống Thông tin Quản lý  
**Trường:** Đại học Kinh tế - Đại học Đà Nẵng  

## 👥 Đội ngũ thực hiện

- **Sinh viên thực hiện:** Lê Nguyễn Ngọc Tú Hương & Trần Phương Đan
  
## 🌐 Trải nghiệm hệ thống (Live Demo)

- **Trang dành cho Thí sinh (Client):** [https://datn-tvts-twht.vercel.app](https://datn-tvts-twht.vercel.app)
- **Trang Quản trị viên (Admin):** [https://datn-tvts-twht.vercel.app/admin/login](https://datn-tvts-twht.vercel.app/admin/login)
- **Tài khoản admin demo:**
  - Email: admin@due.edu.vn
  - Password: admin123
## 📖 1. Tóm tắt dự án (Overview)

Dự án là một hệ thống Website Full-stack hỗ trợ tư vấn tuyển sinh đại học, được tích hợp công nghệ **Trí tuệ nhân tạo (AI)** tiên tiến. Đặc biệt, hệ thống ứng dụng mô hình **RAG (Retrieval-Augmented Generation)** kết hợp với Mô hình ngôn ngữ lớn (LLM - Gemini) để xây dựng một **AI Chatbot** có khả năng tự động đọc hiểu tài liệu của trường và tư vấn chính xác cho thí sinh theo thời gian thực.

Mục tiêu cốt lõi của đề tài là:
- **Tự động hóa** quá trình tư vấn tuyển sinh, giảm tải cho cán bộ tư vấn.
- **Tăng tính chính xác** của thông tin tư vấn dựa trên cơ sở dữ liệu và tài liệu chính thống của nhà trường.
- **Cải thiện trải nghiệm người dùng**, giúp thí sinh tra cứu điểm chuẩn, tính điểm xét tuyển và nhận tư vấn nhanh chóng, trực quan.

## ✨ 2. Các tính năng nổi bật

### 👨‍🎓 Dành cho Thí sinh (Người dùng)
- **AI Chatbot Tư vấn:** Chatbot thông minh trả lời mọi câu hỏi về tuyển sinh, học phí, chương trình đào tạo dựa trên tài liệu thực tế của trường.
- **Xử lý câu hỏi mơ hồ (Smart Ambiguity Handling):** Hệ thống có khả năng nhận diện các câu hỏi thiếu thông tin (ví dụ: chỉ hỏi "điểm chuẩn"). AI sẽ chủ động hỏi ngược lại để làm rõ nhu cầu và đưa ra các gợi ý chủ đề liên quan (Quick Replies) để người dùng dễ dàng tương tác.
- **Tra cứu ngành học & Điểm chuẩn:** Xem thông tin chi tiết về các ngành, chuyên ngành, tổ hợp xét tuyển và biểu đồ điểm chuẩn các năm.
- **Công cụ tính điểm:** Hỗ trợ thí sinh nhập điểm thi/học bạ để tính tổng điểm (có cộng điểm ưu tiên) và gợi ý các ngành phù hợp.

### 👨‍💻 Dành cho Quản trị viên (Admin/Cán bộ Trường)
- **Quản lý Dữ liệu Tuyển sinh:** Thêm, sửa, xóa thông tin Ngành, Chuyên ngành, Phương thức, Chỉ tiêu, Điểm chuẩn.
- **Quản lý Tri thức AI (Knowledge Base):** Nhập liệu hoặc upload tài liệu văn bản (.txt, .md) về quy chế tuyển sinh. Hệ thống sẽ tự động trích xuất, nhúng (embedding) và lưu vào Vector Database để Chatbot học hỏi (Sync Knowledge).
- **Thống kê & Báo cáo:** Xem tổng quan hệ thống, biểu đồ tương tác Chatbot và thống kê dữ liệu tuyển sinh.

## 🏗 3. Kiến trúc Hệ thống (System Architecture)

Hệ thống được thiết kế theo kiến trúc **Microservices (Quy mô nhỏ)** gồm 3 thành phần chính giao tiếp với nhau:

1. **Client (Frontend):** Ứng dụng React cung cấp giao diện người dùng. Giao tiếp với Server qua REST API.
2. **Server (Backend Node.js):** Xử lý nghiệp vụ chính (CRUD dữ liệu), xác thực người dùng, lưu trữ cơ sở dữ liệu quan hệ (MySQL).
3. **AI Service (Backend Python):** Microservice chuyên biệt để xử lý AI. 
   - Nhận câu hỏi từ người dùng.
   - Trích xuất dữ liệu liên quan từ **ChromaDB** (Vector Database).
   - Truyền ngữ cảnh vào **Google Gemini API** để tạo câu trả lời chính xác (Cơ chế RAG).

## 🚀 4. Công nghệ sử dụng (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò trong hệ thống |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS | Xây dựng giao diện UI/UX tương tác cao, responsive. |
| **Backend** | Node.js, Express.js | Quản lý API, Authentication (JWT), Business Logic. |
| **AI Service** | Python, FastAPI, Langchain | Triển khai API cho AI, xử lý pipeline RAG, đọc file tài liệu. |
| **LLM Model** | Google Generative AI (Gemini) | AI tạo sinh để trả lời câu hỏi của người dùng. |
| **Database** | MySQL (Sequelize ORM) | Lưu trữ dữ liệu cấu trúc (User, Major, Score...). |
| **Vector DB** | ChromaDB | Lưu trữ vector nhúng của tài liệu để AI tìm kiếm ngữ nghĩa. |

## ⚙️ 5. Hướng dẫn Cài đặt & Chạy hệ thống

### Yêu cầu môi trường
- **Node.js** (v18 hoặc v20)
- **Python** (v3.9 trở lên)
- **MySQL Server** (chạy ở cổng 3306)

### Bước 1: Cài đặt Dependencies
Bạn cần mở 3 Terminal/Command Prompt để cài đặt cho 3 thư mục tương ứng:

```bash
# 1. Cài đặt Frontend
cd client
npm install

# 2. Cài đặt Backend Node.js
cd server
npm install

# 3. Cài đặt AI Service (Python)
cd ser-py
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

### Bước 2: Cấu hình biến môi trường (.env)
Tạo file `.env` ở các thư mục như sau:

**`server/.env`**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=datn_tvts
JWT_SECRET=my_super_secret_key
CLOUDINARY_URL=your_cloudinary_url_for_image_upload
```

**`ser-py/.env`**
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000
```

### Bước 3: Khởi chạy dự án (One-click)

Để tiện lợi cho việc báo cáo, hệ thống có cung cấp file script khởi chạy tự động trên Windows.

> [!TIP]
> **Chỉ cần click đúp vào file `start_all.bat` tại thư mục gốc.**
> Script sẽ tự động bật 3 cửa sổ CMD tương ứng với Client, Server và Python API.

---
Nếu muốn chạy thủ công:
- Client: `npm run dev` (tại `/client`)
- Server: `node server.js` (tại `/server`)
- Python: `py rag_service.py` (tại `/ser-py` với venv đã kích hoạt)

## 📂 6. Cấu trúc mã nguồn chính

Dự án được phân tách rõ ràng theo chuẩn thiết kế hiện đại, dưới đây là cấu trúc các thư mục quan trọng nhất:

```text
datn-tvts/
├── client/                     # (ReactJS/Vite) Ứng dụng Frontend
│   └── src/                    # Mã nguồn chính của Frontend
│       ├── components/         # Các UI Component dùng chung (Nút, Form, Bảng, Modal...)
│       ├── contexts/           # Quản lý State toàn cục (AuthContext cho Đăng nhập...)
│       ├── layouts/            # Cấu trúc khung giao diện (AdminLayout, MainLayout, Header...)
│       ├── pages/              # Các màn hình chính (Trang chủ, Chi tiết ngành, Chatbot, Quản lý Admin...)
│       ├── services/           # Chứa các file Axios gọi API giao tiếp với Backend
│       └── utils/              # Các hàm tiện ích hỗ trợ (định dạng ngày tháng, tính toán cơ bản...)
│
├── server/                     # (Node.js/Express) Backend xử lý nghiệp vụ chính & Database
│   ├── config/                 # Cấu hình hệ thống và chuỗi kết nối Database
│   ├── controllers/            # Nơi xử lý logic nghiệp vụ của từng API
│   ├── middlewares/            # Các hàm trung gian kiểm tra quyền (Auth, Upload File, Admin Role...)
│   ├── models/                 # Định nghĩa các Schema/Bảng Database (Sử dụng Sequelize ORM)
│   ├── routes/                 # Nơi định tuyến các đường dẫn API Endpoints
│   ├── services/               # Chứa các logic xử lý phức tạp, giảm tải cho Controllers
│   ├── utils/                  # Các hàm dùng chung (Tạo JWT, bắt lỗi, phân tích dữ liệu...)
│   └── server.js               # Điểm vào (Entry point) khởi chạy server Node.js
│
├── ser-py/                     # (Python/FastAPI) Microservice AI & RAG
│   ├── rag_service.py          # Script chính khởi chạy API xử lý Chatbot, nhúng tài liệu và gọi Gemini
│   ├── requirements.txt        # Danh sách các thư viện Python (Langchain, PyPDF, FastAPI...)
│   └── chromadb/               # (Tự sinh ra) Thư mục chứa Vector Database nội bộ của Chroma
│
└── start_all.bat               # Script tự động mở 3 cửa sổ CMD và khởi chạy toàn bộ hệ thống
```
## 📄 7. Bản quyền & Giấy phép (License)

Dự án này được xây dựng độc quyền nhằm mục đích phục vụ cho việc thực hiện và báo cáo Đồ án tốt nghiệp tại trường Đại học Kinh Tế - Đại học Đà Nẵng. Mọi hành vi sao chép hoặc sử dụng source code cho mục đích thương mại đều không được phép.
