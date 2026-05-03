# Giải Thích Chi Tiết Code - DATN Tư Vấn Tuyển Sinh

## 📋 Tổng Quan Hệ Thống

Hệ thống gồm 3 chức năng chính:
1. **Tính Điểm Xét Tuyển (Score Calculator)** - Công cụ tính toán điểm học sinh
2. **Trợ Lý AI Chat (Chatbot)** - Hỗ trợ tư vấn tuyển sinh 24/7
3. **Bảng Điều Khiển Quản Trị (Admin Dashboard)** - Quản lý hệ thống, xem thống kê

---

## 🎓 1. TỰC NĂNG TÍNH ĐIỂM XÉT TUYỂN

### Frontend - `ScoreCalculatorPage.jsx`

**Vị trí:** `/client/src/pages/ScoreCalculatorPage.jsx`

**Chức Năng:**
- Cho phép học sinh nhập điểm và tính toán điểm xét tuyển
- Tính toán điểm ưu tiên, điểm cộng, chứng chỉ ngoại ngữ
- Dự đoán khả năng trúng tuyển

**Các Phần Chính:**

#### 1.1 Cấu Hình Dữ Liệu
```javascript
// Các thành tích được cộng 1.5 điểm
const ACHIEVEMENTS_15 = [
  "Đường lên đỉnh Olympia",
  "Giải KK HSG Quốc gia...", // ...
];

// Các thành tích được cộng 1.0 điểm
const ACHIEVEMENTS_10 = [
  "Giải Khuyến khích HSG...", // ...
];

// Tổ hợp môn học (A00, A01, D01, v.v.)
const COMBINATIONS = [
  { code: 'A00', subjects: ['math', 'physics', 'chemistry'] },
  // ...
];

// Phương pháp nhập điểm (Lớp 10-12, v.v.)
const INPUT_METHODS = [
  { id: '3_sems', label: 'Lớp 10, 11, HK1 lớp 12' },
  // ...
];
```

#### 1.2 Component HeroSection
```javascript
function HeroSection() {
  // Hiển thị tiêu đề, breadcrumb, và mô tả chung
  // CSS: Nền xám (slate-900), gradient background
}
```

#### 1.3 Component CertConversionModal
```javascript
function CertConversionModal({ isOpen, onClose }) {
  // Hiển thị bảng quy đổi chứng chỉ ngoại ngữ
  // Chuyển đổi: IELTS, TOEFL, TOEIC, VSTEP thành điểm
  // Bậc 3, Bậc 4, Bậc 5+
}
```

#### 1.4 Logic Tính Toán Chính

**Bước 1: Tính điểm trung bình môn học**
```javascript
const getSubjectAvg = (subjectKey) => {
  const relevantCols = currentMethod.columns;
  const vals = relevantCols.map(col => parseFloat(scores[col][subjectKey]) || 0);
  const sum = vals.reduce((a, b) => a + b, 0);
  const avg = sum / relevantCols.length;
  return parseFloat(avg.toFixed(2));
};
```

**Bước 2: Tính tổng điểm môn học**
```javascript
const subjectAverages = combination.subjects.map(s => getSubjectAvg(s));
const subjectTotal = subjectAverages.reduce((a, b) => a + b, 0);
// Ví dụ: A00 = Toán + Lý + Hóa
```

**Bước 3: Tính điểm ưu tiên (Priority Points)**
```javascript
const getPriorityPoints = () => {
  let base = 0;
  // Khu vực ưu tiên (KV1: +0.75, KV2NT: +0.5, KV2: +0.25, KV3: 0)
  if (region === 'kv1') base += 0.75;
  
  // Đối tượng ưu tiên (UT1: +2.0, UT2: +1.0)
  if (priorityObj === 'ut1') base += 2.0;
  
  // MOET 2023: Giảm điểm nếu điểm > 22.5
  if (subjectTotal >= 22.5) {
    return base * (30 - subjectTotal) / 7.5;
  }
  return base;
};
```

**Bước 4: Tính điểm thưởng (Academic Bonus)**
```javascript
const calcAcademicBonus = () => {
  // Điểm xét thẳng (nếu có)
  const pointsBonus = isDirectEligible ? 3.0 : 0;
  
  // Điểm xét thưởng (max 1.5)
  const rawAward = (selected15.length * 1.5) + (selected10.length * 1.0);
  const pointsAward = Math.min(rawAward, 1.5);
  
  // Điểm khuyến khích (ngoại ngữ, IT, SAT, ACT)
  let pointsIncentive = 0;
  const incentiveValues = [];
  if (itCert !== 'none') incentiveValues.push(1.5);
  if (satCert === '1100') incentiveValues.push(1.0);
  if (actCert === '22') incentiveValues.push(1.0);
  if (trainingType !== 'Tiêu chuẩn' && englishCert === 'bac4') 
    incentiveValues.push(1.5);
  
  pointsIncentive = Math.max(...incentiveValues);
  
  // Tổng điểm cộng (max 3.0)
  const finalAcademicBonus = Math.min(
    pointsBonus + pointsAward + pointsIncentive, 
    3.0
  );
  return { pointsBonus, pointsAward, pointsIncentive, finalAcademicBonus };
};
```

**Bước 5: Tính tổng điểm cuối cùng**
```javascript
const total = subjectTotal + priorityPoints + finalAcademicBonus;
// Điểm cuối = Điểm môn + Điểm ưu tiên + Điểm cộng
```

#### 1.5 State Management
```javascript
// Phương pháp nhập điểm
const [method, setMethod] = useState('3_sems');

// Tổ hợp môn
const [activeCombo, setActiveCombo] = useState('A00');

// Điểm các môn theo kỳ
const [scores, setScores] = useState({
  grade10: createEmptyScores(),
  grade11: createEmptyScores(),
  grade12_h1: createEmptyScores(),
  grade12_h2: createEmptyScores(),
  grade12_full: createEmptyScores(),
});

// Ưu tiên theo khu vực
const [region, setRegion] = useState('kv3');

// Đối tượng ưu tiên
const [priorityObj, setPriorityObj] = useState('none');

// Chứng chỉ ngoại ngữ, IT, SAT, ACT
const [englishCert, setEnglishCert] = useState('none');
const [itCert, setItCert] = useState('none');
const [satCert, setSatCert] = useState('none');
const [actCert, setActCert] = useState('none');
```

### Backend - Score Service & Controller

**Service Location:** `/client/src/services/historicalScoreService.js`

**API Endpoints:**
```javascript
// Lấy danh sách điểm chuẩn lịch sử
GET /admin/historical-scores?major_id=1&method_id=1&year=2024

// Lấy chi tiết một bản ghi
GET /admin/historical-scores/:id

// Tạo bản ghi điểm mới
POST /admin/historical-scores
{ major_id, method_id, year, score }

// Cập nhật điểm
PUT /admin/historical-scores/:id
{ major_id, method_id, year, score }

// Xóa điểm
DELETE /admin/historical-scores/:id

// Tính ngưỡng trúng tuyển
GET /admin/historical-scores/calculate-threshold/:majorId

// Dự đoán khả năng trúng tuyển
POST /predict-admission
{ major_id, user_score, method_id }
```

**Controller:** `/server/controllers/historicalScoreController.js`

**Hàm Chính:**

#### 1. `getAllHistoricalScores`
```javascript
// Lấy danh sách điểm chuẩn với phân trang
// Query: page, limit, major_id, method_id, year
// Trả về: { total, page, totalPages, data: [...] }
```

#### 2. `createHistoricalScore`
```javascript
// Kiểm tra duplicate (major + method + year)
// Tạo bản ghi mới trong DB
```

#### 3. `calculateThreshold`
```javascript
// Tính trung bình điểm từ 3 năm gần nhất
// Trả về: { average_score, min_score, max_score, years_analyzed }
```

#### 4. `predictAdmission`
```javascript
// So sánh điểm học sinh với trung bình lịch sử
// Trả về: 
// - prediction: 'Safe' | 'Moderate' | 'Risky'
// - recommendation: Lời khuyên tiếng Việt
// - difference: Chênh lệch so với trung bình
```

---

## 💬 2. CHỨC NĂNG CHAT AI

### Frontend - `ChatWidget.jsx`

**Vị trí:** `/client/src/components/ChatWidget.jsx`

**Chức Năng:**
- Widget chat nổi trên góc màn hình
- Hỏi tên, số điện thoại, email, trường học
- Chat với Gemini AI (phiên bản 1.5 Pro)
- Hiển thị gợi ý, thẻ ngành học, biểu đồ điểm chuẩn

#### 2.1 Component Chính

**HeroSection - Phần Giới Thiệu Chat**
```javascript
const GREETINGS = [
  'Xin chào! 👋 Mình là Trợ Lý Tư Vấn Tuyển Sinh - Giải đáp mọi thắc mắc.',
  'Bạn hãy hỏi mình bất cứ điều gì về ngành học, điểm chuẩn, học phí nhé! 🎓'
];
```

**TypingDots - Indicator Đang Gõ**
```javascript
// Hiển thị 3 chấm nhảy khi AI đang trả lời
// Animation: typingBounce (1.2s)
```

**MajorCard - Thẻ Thông Tin Ngành Học**
```javascript
// Hiển thị trong tin nhắn AI:
// - Tên ngành
// - Mã ngành
// - Khoa
// - Học phí
// - Chỉ tiêu
// - Link xem chi tiết
```

**ChartCard - Biểu Đồ Điểm Chuẩn**
```javascript
// Hiển thị lịch sử điểm chuẩn
// - Năm
// - Điểm
// - Ngành học
// - Phương pháp xét tuyển
```

**SuggestionList - Gợi Ý Câu Hỏi**
```javascript
// Hiển thị dưới tin nhắn cuối của bot
// Click → gửi câu hỏi gợi ý tự động
```

**ChatBubble - Bong Bóng Tin Nhắn**
```javascript
// Người dùng: Align phải, background xám
// Bot: Align trái, background trắng
// Hỗ trợ Markdown (React Markdown)
// Hiển thị Cards bên dưới
```

#### 2.2 Welcome Form
```javascript
function WelcomeForm({ onSubmit }) {
  // Nhập: name, phone, email, school
  // Validation: required
  // onSubmit → lưu vào userInfo, hiển thị greeting
}
```

#### 2.3 State Management
```javascript
const [isOpen, setIsOpen] = useState(false);              // Mở/đóng widget
const [isFullscreen, setIsFullscreen] = useState(false);  // Chế độ toàn màn hình
const [showWelcome, setShowWelcome] = useState(true);    // Form chào mừng
const [persona, setPersona] = useState('student');       // Vai trò: học sinh/phụ huynh
const [userInfo, setUserInfo] = useState(null);         // Thông tin người dùng
const [messages, setMessages] = useState([]);            // Lịch sử tin nhắn
const [input, setInput] = useState('');                  // Nội dung nhập
const [loading, setLoading] = useState(false);           // Đang chờ AI
const [sessionId, setSessionId] = useState(null);        // ID phiên chat
```

#### 2.4 Hàm Chính

**`handleWelcomeSubmit`**
```javascript
// Lưu thông tin người dùng
// Ẩn welcome form
// Insert greeting messages
```

**`handleSend`**
```javascript
// Thêm tin nhắn người dùng vào messages
// Call API sendMessage
// Nhận phản hồi từ server
// Parse majorCard, chart, suggestions từ response
// Thêm tin nhắn bot vào messages
```

**`scrollToBottom`**
```javascript
// Cuộn xuống cuối chat khi có tin nhắn mới
```

### Frontend - `chatService.js`

**Vị trí:** `/client/src/services/chatService.js`

```javascript
// Gửi tin nhắn
export const sendMessage = async (messageData) => {
  const response = await api.post('/chat', messageData);
  return response.data;
};

// Lấy lịch sử chat
export const getChatHistory = async (sessionId) => {
  const response = await api.get(`/chat/history/${sessionId}`);
  return response.data;
};

// Quản lý phiên chat (admin)
export const getAllChatSessions = async (params = {}) => {
  const response = await api.get('/admin/chat-sessions', { params });
  return response.data;
};

// Thống kê chat (admin)
export const getChatStatistics = async () => {
  const response = await api.get('/admin/chat/statistics');
  return response.data;
};
```

### Backend - Chat Controller

**Vị trí:** `/server/controllers/chatController.js`

#### 1. `sendMessage` - Gửi & Nhận Tin Nhắn
```javascript
const sendMessage = async (req, res) => {
  const { message, sessionId, context } = req.body;

  // Lấy hoặc tạo phiên chat
  let session;
  if (sessionId) {
    session = await ChatSession.findByPk(sessionId);
  }
  if (!session) {
    session = await ChatSession.create({
      user_id: req.user?.id || null,
      visitor_name: context?.user_info?.name,
      visitor_phone: context?.user_info?.phone,
      visitor_email: context?.user_info?.email,
      visitor_school: context?.user_info?.school
    });
  }

  // Lưu tin nhắn người dùng
  await ChatMessage.create({
    session_id: session.id,
    role: 'user',
    content: message
  });

  // Lấy lịch sử 10 tin nhắn cuối
  const history = await ChatMessage.findAll({
    where: { session_id: session.id },
    order: [['createdAt', 'ASC']],
    limit: 10
  });

  // Gọi Gemini API
  const aiResponse = await geminiService.generateResponse(
    message,
    persona,
    history
  );

  // Lưu phản hồi AI
  await ChatMessage.create({
    session_id: session.id,
    role: 'assistant',
    content: aiResponse.reply,
    metadata: aiResponse.related_data || null
  });

  // Trả về kết quả
  return {
    sessionId: session.id,
    reply: aiResponse.reply,
    suggestions: aiResponse.suggestions,
    majorCard: aiResponse.related_data?.type === 'major_card' ? aiResponse.related_data.data : null,
    chart: aiResponse.related_data?.type === 'chart' ? aiResponse.related_data.data : null
  };
};
```

#### 2. `getAllChatSessions` - Lấy Danh Sách Phiên
```javascript
// Phân trang: page, limit (default: 1, 20)
// Filter: user_id
// Include: Tin nhắn cuối cùng của mỗi phiên
// Order: createdAt DESC
```

#### 3. `getChatSessionById` - Chi Tiết Phiên
```javascript
// Include: Tất cả ChatMessages
// Order: createdAt ASC
```

#### 4. `getChatHistory` - Lịch Sử Tin Nhắn
```javascript
// Lấy tất cả tin nhắn của một phiên
// Order: createdAt ASC
```

#### 5. `deleteChatSession` - Xóa Phiên
```javascript
// Xóa tất cả ChatMessages
// Xóa ChatSession
```

#### 6. `cleanupOldSessions` - Dọn Dẹp Phiên Cũ
```javascript
// Query: days (default: 30)
// Xóa phiên chưa cập nhật trong số ngày chỉ định
```

#### 7. `getChatStatistics` - Thống Kê
```javascript
// Tính:
// - Total sessions
// - Total messages
// - Active sessions trong 24h
// - Avg messages per session
```

### Backend - Chat Models

**ChatSession Model** (`/server/models/chatSession.js`)
```javascript
class ChatSession extends Model {
  user_id: INTEGER,           // FK: users.id (null nếu khách)
  visitor_name: STRING,       // Tên khách
  visitor_phone: STRING,      // Số điện thoại
  visitor_email: STRING,      // Email
  visitor_school: STRING,     // Trường THPT
  
  // Association:
  belongsTo(User)
  hasMany(ChatMessage)
}
```

**ChatMessage Model** (`/server/models/chatMessage.js`)
```javascript
class ChatMessage extends Model {
  session_id: INTEGER,        // FK: chat_sessions.id
  role: ENUM('user', 'assistant'),
  content: TEXT,             // Nội dung tin nhắn
  metadata: JSON,            // Dữ liệu có cấu trúc (major card, chart)
  
  // Association:
  belongsTo(ChatSession)
}
```

---

## 📊 3. CHỨC NĂNG ADMIN DASHBOARD

### Frontend - `AdminDashboard.jsx`

**Vị trí:** `/client/src/pages/admin/AdminDashboard.jsx`

**Chức Năng:**
- Xem tổng quan hệ thống (KPI cards)
- Hiển thị xu hướng chat (LineChart)
- Top questions (HelpCircle)
- System health (AI status)
- Export báo cáo (Excel, PDF)

#### 3.1 StatCard Component
```javascript
const StatCard = ({ icon, label, value, subValue, color, loading }) => (
  <div>
    {/* Icon + Label */}
    {/* Value (lớn) */}
    {/* SubValue (nhỏ, dạng trend) */}
    {/* Background gradient */}
  </div>
);
```

#### 3.2 Metrics Cards
```javascript
const cards = [
  { 
    icon: GraduationCap, 
    label: 'Ngành đào tạo', 
    value: dashCount.majors,
    subValue: 'Chương trình đại học'
  },
  { 
    icon: Users, 
    label: 'Quản trị viên', 
    value: dashCount.users,
    subValue: 'Tài khoản hệ thống'
  },
  { 
    icon: MessageSquare, 
    label: 'Phiên Chat AI', 
    value: dashCount.chat_sessions,
    subValue: 'Lượt tương tác'
  },
  { 
    icon: School, 
    label: 'Trường THPT', 
    value: chatStats?.schools.length,
    subValue: 'Số trường tham gia'
  }
];
```

#### 3.3 Recent Messages Section
```javascript
// Hiển thị 10-15 tin nhắn gần nhất từ chat
// Mỗi dòng:
// - Avatar người dùng
// - Email/Tên/ID
// - Nội dung tin nhắn (italic, có border left)
// - Timestamp
// - Link "Chi tiết" → /admin/chat-sessions/:id
```

#### 3.4 Top Questions
```javascript
// Hiển thị top 5 câu hỏi phổ biến
// Dạng numbered list
// - Câu hỏi (truncate)
// - Số lượt hỏi
```

#### 3.5 System Health Status
```javascript
// Hiển thị:
// - DATABASE: Ổn định (Emerald)
// - GEMINI PRO: Sẵn sàng (Blue)
// - UPTIME: Số giờ, phút
// Nền đen (slate-900) với gradient accent
```

#### 3.6 Analytics Charts

**Usage Trend (LineChart)**
```javascript
// X-axis: Ngày (DD/MM format)
// Y-axis: Số phiên chat
// Line: Blue (#2563eb)
// Với tooltip, legend
```

**High School Sources (BarChart)**
```javascript
// Layout: Horizontal
// Top 5 trường THPT
// Bar color: Gradient từ COLORS array
// Y-axis: Tên trường (80px width)
```

**Major Interests (PieChart)**
```javascript
// Pie chart các ngành học
// Colors: COLORS array
// Legend: Tên ngành + số lượng
```

#### 3.7 Export Functionality

**Excel Export**
```javascript
// Sheets:
// 1. Tổng quan (counts, uptime)
// 2. Xu hướng Chat (usage by date)
// 3. Quan tâm ngành học
// 4. Nguồn trường THPT
// 5. Câu hỏi phổ biến
// Format: .xlsx
```

**PDF Export**
```javascript
// Gọi: statisticsService.exportDashboardPDF()
// Tạo blob, download
// Format: PDF standard
```

#### 3.8 useEffect Hook
```javascript
useEffect(() => {
  // Load data khi mount
  // Call 3 API song song:
  // 1. statisticsService.getDashboardStats()
  // 2. statisticsService.getMajorStats()
  // 3. statisticsService.getChatbotStats()
  // setState({ dashboard, majors, chatStats })
}, []);
```

### Backend - Routes

**Public Routes** (`/server/routes/publicRoutes.js`)
```javascript
// Chat endpoints
POST /api/chat                          // Gửi tin nhắn
GET /api/chat/history/:sessionId       // Lấy lịch sử

// Score endpoints
POST /api/predict-admission             // Dự đoán trúng tuyển
```

**Admin Routes** (`/server/routes/adminRoutes.js`)
```javascript
// Historical scores
GET /api/admin/historical-scores
GET /api/admin/historical-scores/:id
POST /api/admin/historical-scores
PUT /api/admin/historical-scores/:id
DELETE /api/admin/historical-scores/:id
GET /api/admin/historical-scores/calculate-threshold/:majorId

// Chat sessions
GET /api/admin/chat-sessions
GET /api/admin/chat-sessions/:id
DELETE /api/admin/chat-sessions/:id
DELETE /api/admin/chat-sessions/cleanup/old

// Chat statistics
GET /api/admin/chat/statistics

// Dashboard statistics
GET /api/admin/dashboard/stats
GET /api/admin/statistics/majors
GET /api/admin/statistics/chatbot
```

---

## 🔄 Flow Diagram

### Score Calculator Flow
```
User Input (Điểm môn)
  ↓
[Method Selection] → [Combination Selection]
  ↓
[Score Input] → Tính Subject Average
  ↓
[Priority Region] → Tính Priority Points
  ↓
[Achievements + Certs] → Tính Academic Bonus
  ↓
Total Score = Subject Total + Priority + Bonus
  ↓
Display Result + Prediction
  ↓
API: POST /predict-admission → Backend prediction
```

### Chat Flow
```
Widget Open
  ↓
WelcomeForm (Name, Phone, Email, School)
  ↓
User Message
  ↓
API: POST /chat
  ├─ Create/Update ChatSession
  ├─ Save ChatMessage (user)
  ├─ Call geminiService.generateResponse()
  ├─ Parse Response (text, majorCard, chart, suggestions)
  └─ Save ChatMessage (assistant)
  ↓
Display Bot Response + Cards + Suggestions
```

### Admin Dashboard Flow
```
Dashboard Load
  ↓
useEffect → Promise.all([
  getDashboardStats(),
  getMajorStats(),
  getChatbotStats()
])
  ↓
State Update
  ↓
Render Metrics Cards
  ├─ StatCard (counts)
  ├─ Recent Messages
  ├─ Top Questions
  └─ System Health
  ↓
Render Charts
  ├─ Usage Trend (Line)
  ├─ High Schools (Bar)
  └─ Majors (Pie)
  ↓
Export Options (Excel/PDF)
```

---

## 📱 API Summary

### Public APIs
| Method | Endpoint | Params | Response |
|--------|----------|--------|----------|
| POST | `/api/chat` | message, sessionId, context | { sessionId, reply, suggestions, majorCard, chart } |
| GET | `/api/chat/history/{sessionId}` | - | [ { role, content, metadata } ] |
| POST | `/api/predict-admission` | major_id, user_score, method_id | { prediction, recommendation, historical_scores } |

### Admin APIs
| Method | Endpoint | Params | Response |
|--------|----------|--------|----------|
| GET | `/api/admin/historical-scores` | page, limit, major_id | { total, page, totalPages, data } |
| POST | `/api/admin/historical-scores` | major_id, method_id, year, score | { id, major_id, ... } |
| GET | `/api/admin/chat-sessions` | page, limit, user_id | { total, page, data } |
| GET | `/api/admin/chat/statistics` | - | { total_sessions, total_messages, active_sessions_24h } |

---

## 🗂️ File Structure
```
client/src/
├── pages/
│   ├── ScoreCalculatorPage.jsx          # Tính điểm
│   ├── admin/
│   │   ├── AdminDashboard.jsx           # Bảng điều khiển
│   │   └── ...
├── components/
│   ├── ChatWidget.jsx                   # Widget chat
│   └── ...
└── services/
    ├── chatService.js                   # API client - chat
    ├── historicalScoreService.js        # API client - score
    └── ...

server/
├── controllers/
│   ├── chatController.js                # Logic chat
│   └── historicalScoreController.js     # Logic điểm
├── models/
│   ├── chatSession.js
│   ├── chatMessage.js
│   └── historicalScore.js
└── routes/
    ├── publicRoutes.js                  # Public endpoints
    └── adminRoutes.js                   # Admin endpoints
```

---

## 🎯 Key Design Patterns

### 1. Service Layer Pattern
- `chatService.js` → API calls
- `historicalScoreService.js` → API calls
- Controllers xử lý business logic

### 2. Component Composition
- `ChatWidget` (Main) → `ChatBubble` → `MajorCard`, `ChartCard`, `SuggestionList`
- `AdminDashboard` → `StatCard`, `Charts`

### 3. State Management
- React hooks (`useState`, `useEffect`)
- Props drilling cho callbacks
- API response caching via SWR (nếu dùng)

### 4. Error Handling
- Try-catch trong controllers
- Error response với HTTP status codes
- User-friendly error messages

### 5. Data Validation
- Frontend: HTML5 validation
- Backend: Kiểm tra required fields
- Duplicate check (unique constraints)

---

## 🚀 Deployment Notes

1. **Environment Variables:**
   - `GEMINI_API_KEY` - API key cho Gemini
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD` - Database
   - `JWT_SECRET` - JWT signing key

2. **Database:**
   - Sequelize ORM
   - Models: ChatSession, ChatMessage, HistoricalScore
   - Migrations: sequelize migration

3. **Frontend Build:**
   - Vite (nếu React 18+)
   - Output: `/client/dist`

4. **Backend Start:**
   - `node server/index.js`
   - Port: 5000 (default)

---

**Created:** 2024
**Last Updated:** May 3, 2026
