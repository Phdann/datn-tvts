import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';

import Home from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MajorList from './pages/MajorList';
import MajorDetail from './pages/MajorDetail';
import NewsListPage from './pages/NewsListPage';
import NewsDetailPage from './pages/NewsDetailPage';
import EventsPage from './pages/EventsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import AdmissionMethodsPage from './pages/AdmissionMethodsPage';
import ScoreLookupPage from './pages/ScoreLookupPage';
import ScoreCalculatorPage from './pages/ScoreCalculatorPage';
import FAQPage from './pages/FAQPage';
import FacultyPage from './pages/FacultyPage';
import AdmissionQuotaPage from './pages/AdmissionQuotaPage';
import InternationalLinkagePage from './pages/InternationalLinkagePage';
import StudentExchangePage from './pages/StudentExchangePage';
import HeChinhQuyPage from './pages/HeChinhQuyPage';
import HeVuaLamVuaHocPage from './pages/HeVuaLamVuaHocPage';
import TrainingTypesPage from './pages/TrainingTypesPage';
import Login from './pages/admin/Login';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMajorList from './pages/admin/AdminMajorList';
import AdminMajorDetail from './pages/admin/AdminMajorDetail';
import RegisterAdmin from './pages/admin/RegisterAdmin';
import AdminNews from './pages/admin/AdminNews';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSpecializations from './pages/admin/AdminSpecializations';
import AdminFaculties from './pages/admin/AdminFaculties';
import AdminChatData from './pages/admin/AdminChatData';
import AdminChatDataManager from './pages/admin/AdminChatDataManager';
import AdminChatSessions from './pages/admin/AdminChatSessions';
import AdminChatSessionDetail from './pages/admin/AdminChatSessionDetail';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAdmissionMethods from './pages/admin/AdminAdmissionMethods';
import AdminHistoricalScores from './pages/admin/AdminHistoricalScores';
import AdminQuotas from './pages/admin/AdminQuotas';
import AdminScholarships from './pages/admin/AdminScholarships';
import AdminPolicies from './pages/admin/AdminPolicies';
import AdminChatStatistics from './pages/admin/AdminChatStatistics';
import AdminTrainingTypes from './pages/admin/AdminTrainingTypes';
import MaintenancePage from './pages/admin/MaintenancePage';

import ScholarshipPage from './pages/ScholarshipPage';
import PolicyPage from './pages/PolicyPage';

import ChatWidget from './components/ChatWidget';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import AdmissionPredictor from './components/AdmissionPredictor';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ScrollToTop from './components/ScrollToTop';

function PredictPage() {
  return (
    <div className="bg-white py-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-[#2563eb] uppercase tracking-tighter">Dự đoán điểm chuẩn</h1>
        <p className="text-lg text-gray-500 font-medium">Sử dụng AI để dự đoán khả năng trúng tuyển</p>
      </div>
      <AdmissionPredictor />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ConfigProvider>
          <Router>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Routes>
                {/* ================= PUBLIC ROUTES ================= */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/gioi-thieu" element={<AboutPage />} />
                  <Route path="/lien-he" element={<ContactPage />} />
                  
                  <Route path="/tin-tuc" element={<NewsListPage />} />
                  <Route path="/tin-tuc/:slug" element={<NewsDetailPage />} />
                  <Route path="/su-kien" element={<EventsPage />} />
                  <Route path="/thong-bao" element={<AnnouncementsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/khoa" element={<MajorList />} />
                  <Route path="/khoa/:slug" element={<FacultyPage />} />
                  
                  <Route path="/nganh-dao-tao" element={<MajorList />} />
                  <Route path="/nganh-dao-tao/:id" element={<MajorDetail />} />
                  <Route path="/majors" element={<MajorList />} />
                  
                  <Route path="/phuong-thuc-xet-tuyen" element={<AdmissionMethodsPage />} />
                  <Route path="/phuong-thuc" element={<AdmissionMethodsPage />} />
                  <Route path="/tra-cuu-diem-chuan" element={<ScoreLookupPage />} />
                  <Route path="/tinh-diem-xet-tuyen" element={<ScoreCalculatorPage />} />
                  <Route path="/chi-tieu-tuyen-sinh" element={<AdmissionQuotaPage />} />
                  <Route path="/chi-tieu" element={<AdmissionQuotaPage />} /> 
                  
                  <Route path="/lien-ket-quoc-te" element={<InternationalLinkagePage />} />
                  <Route path="/trao-doi-sinh-vien" element={<StudentExchangePage />} />
                  <Route path="/hoc-bong-chinh-sach" element={<ScholarshipPage />} />
          <Route path="/chinh-sach-mien-giam" element={<PolicyPage />} />
                  <Route path="/he-chinh-quy" element={<HeChinhQuyPage />} />
                  <Route path="/he-vua-lam-vua-hoc" element={<HeVuaLamVuaHocPage />} />
                  <Route path="/loai-hinh-dao-tao" element={<TrainingTypesPage />} />
                  
                   <Route path="/du-bao-kha-nang-do" element={<PredictPage />} />
                  <Route path="/predict" element={<PredictPage />} />
                  
                   <Route path="/hoi-dap-faq" element={<FAQPage />} />
                  
  
                  <Route path="/admin/login" element={<Login />} />
                  <Route path="/admin/register" element={<RegisterAdmin />} />
                  
                  {/* 404 Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
  
                {/* ================= ADMIN ROUTES ================= */}
                <Route path="/admin/*" element={
                  <Routes>
                    <Route element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                       <Route index element={<AdminDashboard />} />
                      <Route path="majors" element={<AdminMajorList />} />
                      <Route path="majors/:id" element={<AdminMajorDetail />} />
                      <Route path="admission-methods" element={<AdminAdmissionMethods />} />
                      <Route path="historical-scores" element={<AdminHistoricalScores />} />
                      <Route path="specializations" element={<AdminSpecializations />} />
                      <Route path="faculties" element={<AdminFaculties />} />
                      <Route path="quotas" element={<AdminQuotas />} />
                      <Route path="training-types" element={<AdminTrainingTypes />} />
                      <Route path="news" element={<AdminNews />} />
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="banners" element={<AdminBanners />} />
                      <Route path="scholarships" element={<AdminScholarships />} />
            <Route path="policies" element={<AdminPolicies />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="chat-data" element={<AdminChatDataManager />} />
                      <Route path="chat-data/new" element={<AdminChatData />} />
                      <Route path="chat-data/edit/:id" element={<AdminChatData />} />
                      <Route path="chat-sessions" element={<AdminChatSessions />} />
                      <Route path="chat-sessions/:id" element={<AdminChatSessionDetail />} />
                      <Route path="chat-stats" element={<AdminChatStatistics />} />
                    </Route>
                  </Routes>
                } />
              </Routes>
              
              <ChatWidget />
            </div>
          </Router>
        </ConfigProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
