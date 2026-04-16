import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  GraduationCap,
  BookOpen,
  FileCheck,
  Search,
  Calculator,
  BarChart3,
  Award,
  Newspaper,
  CalendarDays,
  Bell,
  Building2,
  Loader2,
  Phone,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { getFaculties } from '../services/facultyService';
import { searchService } from '../services';
import { useConfig } from '../contexts/ConfigContext';
import LogoDUE from '../assets/Logo_DUE.jpg';


const tuyenSinhItems = [
  { label: 'Phương thức xét tuyển', to: '/phuong-thuc-xet-tuyen' },
  { label: 'Chỉ tiêu tuyển sinh', to: '/chi-tieu-tuyen-sinh' },
  { label: 'Điểm chuẩn xét tuyển', to: '/tra-cuu-diem-chuan' },
  { label: 'Chính sách miễn/giảm học phí', to: '/chinh-sach-mien-giam' },
  { label: 'Loại hình đào tạo', to: '/loai-hinh-dao-tao' },
];

const chuongTrinhItems = [
  { label: 'Hệ chính quy', to: '/he-chinh-quy' },
];

const tinTucItems = [
  { label: 'Tin tức', to: '/tin-tuc' },
  { label: 'Thông báo', to: '/thong-bao' },
];

const lienHeItems = [
  { label: 'Liên hệ', to: '/lien-he' },
  { label: 'Câu hỏi thường gặp', to: '/hoi-dap-faq' },
];


function DropdownMenu({ label, items, isActive }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timeout = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleEnter = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-0.5 px-2 py-2 text-xs xl:text-sm font-bold transition-colors ${
          isActive
            ? 'text-primary'
            : 'text-slate-700 hover:text-primary'
        }`}
      >
        {label}
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`absolute top-full left-0 mt-0 w-64 bg-white border border-slate-200 rounded-md z-50 transition-all duration-200 origin-top shadow-xl ${
          open
            ? 'opacity-100 scale-y-100 pointer-events-auto'
            : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        <div className="py-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors font-medium border-b border-slate-50 last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function FacultyDropdown({ label, faculties, isActive }) {
  const [open, setOpen] = useState(false);
  const [hoveredFaculty, setHoveredFaculty] = useState(null);
  const ref = useRef(null);
  const timeout = useRef(null);

  useEffect(() => {
    if (faculties.length > 0 && !hoveredFaculty) {
      setHoveredFaculty(faculties[0]);
    }
  }, [faculties, hoveredFaculty]);

  const handleEnter = () => {
    clearTimeout(timeout.current);
    setOpen(true);
  };
  const handleLeave = () => {
    timeout.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-0.5 px-2 py-2 text-xs xl:text-sm font-bold transition-colors ${
          isActive ? 'text-primary' : 'text-slate-700 hover:text-primary'
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        className={`absolute top-full left-0 mt-0 bg-white border border-slate-200 rounded-md z-50 transition-all duration-200 origin-top shadow-2xl flex min-w-[500px] ${
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        {/* Faculties List */}
        <div className="w-1/2 border-r border-slate-100 py-2 max-h-[450px] overflow-y-auto">
          {faculties.map((f) => (
            <div
              key={f.id}
              onMouseEnter={() => setHoveredFaculty(f)}
              className={`px-4 py-2.5 text-sm font-bold cursor-pointer transition-colors flex items-center justify-between ${
                hoveredFaculty?.id === f.id ? 'bg-primary text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <Link to={`/khoa/${f.slug}`} onClick={() => setOpen(false)} className="flex-1">{f.name}</Link>
              <ChevronRight className={`w-3 h-3 ${hoveredFaculty?.id === f.id ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          ))}
        </div>

        {/* Majors List for Hovered Faculty */}
        <div className="w-1/2 py-2 bg-slate-50/50 max-h-[450px] overflow-y-auto">
          {hoveredFaculty ? (
            <div className="px-2">
              <p className="px-3 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-2">
                Các ngành thuộc {hoveredFaculty.name}
              </p>
              {hoveredFaculty.Majors?.map((m) => (
                <div key={m.id} className="mb-1 last:mb-0">
                  <Link
                    to={`/nganh-dao-tao/${m.id}`}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-xs font-bold text-slate-700 hover:text-primary hover:bg-white transition-all leading-relaxed rounded-lg"
                  >
                    {m.name}
                  </Link>
                  {m.Specializations && m.Specializations.length > 0 && (
                    <div className="pl-6 pb-1 space-y-0.5">
                      {m.Specializations.map((s) => (
                        <div key={s.id} className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5">
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(!hoveredFaculty.Majors || hoveredFaculty.Majors.length === 0) && (
                <p className="px-3 py-4 text-xs italic text-slate-400">Chưa có thông tin ngành học</p>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Chọn một khoa để xem các ngành đào tạo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



function MobileDropdown({ label, items, onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-blue-800"
      >
        {label}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="bg-slate-50 border-t border-slate-100">
          {items.map((item) => {
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className="block px-8 py-2.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}




function MobileFacultyItem({ faculty, onNavigate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-50 last:border-0">
      <div className="flex items-center justify-between w-full pr-4">
        <Link
          to={`/khoa/${faculty.slug}`}
          onClick={onNavigate}
          className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-primary transition-colors"
        >
          {faculty.name}
        </Link>
        <button
          onClick={() => setOpen(!open)}
          className="p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="bg-slate-50/50 border-t border-slate-100 py-1.5 space-y-0.5">
          {faculty.Majors?.map(m => (
            <div key={m.id}>
              <Link
                to={`/nganh-dao-tao/${m.id}`}
                onClick={onNavigate}
                className="block px-8 py-2 text-sm font-bold text-slate-600 hover:text-primary transition-colors"
              >
                {m.name}
              </Link>
              {m.Specializations && m.Specializations.length > 0 && (
                <div className="pl-12 pb-2 space-y-1">
                  {m.Specializations.map(s => (
                    <div key={s.id} className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                       <span className="w-1 h-1 bg-slate-300 rounded-full" />
                       {s.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {(!faculty.Majors || faculty.Majors.length === 0) && (
            <p className="px-8 py-3 text-xs italic text-slate-400">Chưa có thông tin ngành học</p>
          )}
        </div>
      )}
    </div>
  );
}


export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);

  const { config } = useConfig();
  const universityName = config.university_name || 'Đại học Kinh tế — Đại học Đà Nẵng';

  const [faculties, setFaculties] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);

  useEffect(() => {
    getFaculties()
      .then((data) => {
        setFaculties(Array.isArray(data) ? data : data?.data || []);
      })
      .catch(() => setFaculties([]))
      .finally(() => setFacultiesLoading(false));
  }, []);

  // Handle outside click for search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search suggestions logic with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchService.searchSuggestions(searchQuery);
        setSuggestions(res.data?.suggestions || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Suggestions error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isAdmissionActive = tuyenSinhItems.some((i) => pathname === i.to || pathname.startsWith(i.to + '/'));
  const isDaoTaoActive = pathname.startsWith('/khoa') || pathname.startsWith('/nganh-dao-tao');
  const isNewsActive = pathname.startsWith('/tin-tuc') || pathname.startsWith('/su-kien') || pathname.startsWith('/thong-bao');
  const isContactActive = pathname === '/lien-he' || pathname === '/hoi-dap-faq';
  const isScholarshipActive = pathname === '/hoc-bong-chinh-sach';

  const closeMobile = () => setMobileOpen(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={LogoDUE} alt="Logo DUE" className="w-11 h-11 object-contain" />
          <div className="hidden xl:block">
            <p className="text-primary font-black text-[9px] leading-tight tracking-tight uppercase">
              TRƯỜNG ĐẠI HỌC KINH TẾ - ĐẠI HỌC ĐÀ NẴNG
            </p>
            <p className="text-[11px] text-slate-800 leading-tight font-black uppercase mt-0.5">
              CỔNG THÔNG TIN TUYỂN SINH
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          <NavLink to="/gioi-thieu" label="Khám phá DUE" active={pathname === '/gioi-thieu'} />

          <FacultyDropdown
            label="Đào tạo"
            faculties={faculties}
            isActive={isDaoTaoActive}
          />
          <DropdownMenu label="Tuyển sinh đại học" items={tuyenSinhItems} isActive={isAdmissionActive} />
          
          <NavLink to="/hoc-bong-chinh-sach" label="Học bổng" active={pathname === '/hoc-bong-chinh-sach'} />
          <DropdownMenu label="Tin tức" items={tinTucItems} isActive={isNewsActive} />
          <DropdownMenu label="Hỗ trợ" items={lienHeItems} isActive={isContactActive} />
        </nav>

        <div className="relative flex-shrink-0 flex items-center" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="relative group/search">
               <input
                 type="text"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onFocus={() => setShowSuggestions(true)}
                 placeholder="Tìm kiếm..."
                 className="w-10 h-10 pl-9 pr-2 py-1.5 border border-transparent bg-slate-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all duration-300 focus:w-48 xl:focus:w-64 cursor-pointer focus:cursor-text group-hover/search:bg-slate-100"
               />
               <div className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
                 {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
               </div>
            </div>
          </form>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 max-h-[400px] overflow-y-auto">
                <p className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gợi ý kết quả</p>
                {suggestions.map((s) => (
                  <Link
                    key={`${s.type}-${s.id}`}
                    to={s.href}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors group/item rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover/item:bg-primary/10 transition-colors">
                      {s.type === 'major' && <GraduationCap className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />}
                      {s.type === 'faculty' && <Building2 className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />}
                      {s.type === 'post' && <FileText className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />}
                      {s.type === 'event' && <CalendarDays className="w-4 h-4 text-slate-400 group-hover/item:text-primary" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate group-hover/item:text-primary transition-colors">{s.text}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{s.type === 'post' ? 'Tin tức' : s.type === 'major' ? 'Ngành học' : s.type === 'faculty' ? 'Khoa' : 'Sự kiện'}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button 
                onClick={handleSearchSubmit}
                className="w-full py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Xem tất cả kết quả
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/tinh-diem-xet-tuyen"
            className="hidden xl:inline-flex items-center gap-1.5 bg-primary text-white font-black px-3 py-2 text-[10px] rounded-lg hover:bg-primary-dark transition-all transform active:scale-95 shadow-md shadow-primary/20"
          >
            <Calculator className="w-3.5 h-3.5" />
            TÍNH ĐIỂM
          </Link>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-slate-700"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? 'max-h-[800px] border-t border-slate-100' : 'max-h-0'
        }`}
      >
        <div className="bg-white pb-4">
         
          <form onSubmit={handleSearchSubmit} className="flex items-center px-4 pt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              className="absolute right-6 text-slate-500 hover:text-primary"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          <MobileLink to="/gioi-thieu" label="Khám phá DUE" onClick={closeMobile} />

          <div className="border-b border-slate-100 pb-2">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đào tạo</p>
            {faculties.map(f => (
              <MobileFacultyItem key={f.id} faculty={f} onNavigate={closeMobile} />
            ))}
          </div>

          <MobileDropdown label="Tuyển sinh đại học" items={tuyenSinhItems} onNavigate={closeMobile} />
          <MobileLink to="/hoc-bong-chinh-sach" label="Học bổng" onClick={closeMobile} />
          <MobileDropdown label="Tin tức" items={tinTucItems} onNavigate={closeMobile} />
          <MobileDropdown label="Hỗ trợ" items={lienHeItems} onNavigate={closeMobile} />

          <div className="px-4 mt-6">
            <Link
              to="/tinh-diem-xet-tuyen"
              onClick={closeMobile}
              className="flex items-center justify-center gap-2 w-full bg-primary text-white font-bold py-3 rounded-xl"
            >
              <Calculator className="w-4 h-4" />
              Tính điểm xét tuyển
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`px-2 py-2 text-xs xl:text-sm font-bold transition-colors ${
        active ? 'text-primary' : 'text-slate-700 hover:text-primary'
      }`}
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-3 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
    >
      {label}
    </Link>
  );
}
