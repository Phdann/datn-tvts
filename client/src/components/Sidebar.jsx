import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronDown, Facebook, Phone, Globe, GraduationCap } from 'lucide-react';
import api from '../services/api';

function Sidebar() {
  const location = useLocation();
  const [expandedIds, setExpandedIds] = useState(['chuyen-nganh']); // Default open "Chuyên ngành"
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    loadMajors();
  }, []);

  const loadMajors = async () => {
    try {
      // Load majors with specializations
      const response = await api.get('/majors');
      const majorList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setMajors(majorList);
    } catch (error) {
      console.error('Error loading majors for sidebar:', error);
      setMajors([]); 
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const isExpanded = (id) => expandedIds.includes(id);

  const SidebarItem = ({ label, id, icon: Icon, path, hasSub, children }) => {
    const active = location.pathname === path;
    const expanded = isExpanded(id);

    return (
      <div className="border-b border-gray-100 last:border-0">
        <div 
          onClick={() => hasSub ? toggleExpand(id) : null}
          className={`
            group flex items-center justify-between p-4 cursor-pointer
            hover:bg-gray-50 transition-colors
            ${active ? 'bg-blue-50/50' : ''}
          `}
        >
          {path && !hasSub ? (
            <Link to={path} className="flex-1 flex items-center gap-2">
              <span className={`text-[15px] font-bold ${active ? 'text-[#004a99]' : 'text-[#00558d]'}`}>
                {label}
              </span>
            </Link>
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <span className={`text-[15px] font-bold text-[#00558d] group-hover:text-[#004a99]`}>
                {label}
              </span>
            </div>
          )}
          
          {hasSub && (
            expanded ? 
              <ChevronDown className="w-4 h-4 text-[#004a99]" /> : 
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#004a99]" />
          )}
        </div>
        
        {hasSub && expanded && (
          <div className="bg-gray-50/50">
            {children}
          </div>
        )}
      </div>
    );
  };

  // Helper for Child Item
  const SidebarSubItem = ({ label, path, isNested }) => {
    const active = location.pathname === path;
    return (
      <Link
        to={path}
        className={`
          block py-2.5 pr-4 transition-colors text-[14px]
          ${isNested ? 'pl-12' : 'pl-8'}
          ${active ? 'text-[#004a99] font-bold' : 'text-gray-600 font-medium'}
          hover:text-[#004a99]
        `}
      >
        {label}
      </Link>
    );
  };

  // Helper for Major Item (Nested Accordion) - Shows Specializations
  const MajorItem = ({ major }) => {
    const id = `major-${major.id}`;
    const expanded = isExpanded(id);
    
    return (
      <div className="border-t border-gray-100/50 first:border-0">
        <div 
          onClick={() => toggleExpand(id)}
          className="flex items-center justify-between py-2.5 pl-8 pr-4 cursor-pointer group hover:bg-white"
        >
          <span className="text-[14px] font-medium text-[#00558d] group-hover:text-[#004a99]">
            {major.name}
          </span>
          {expanded ? 
            <ChevronDown className="w-3 h-3 text-[#004a99]" /> : 
            <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#004a99]" />
          }
        </div>
        {expanded && (
          <div className="bg-white/50">
            {major.Specializations?.map(spec => (
              <SidebarSubItem 
                key={spec.id} 
                label={spec.name} 
                path={`/chuyen-nganh/${spec.id}`} 
                isNested={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-none">
      <div className="flex flex-col">
        {/* Regular Items */}
        <SidebarItem label="Phương thức xét tuyển" path="/phuong-thuc-xet-tuyen" />
        <SidebarItem label="Kê khai thông tin xét tuyển" path="/dang-ky-xet-tuyen" />
        <SidebarItem label="Chỉ tiêu tuyển sinh" path="/chi-tieu-tuyen-sinh" />

        {/* International Programs (Static Submenu) */}
        <SidebarItem label="Chương trình liên kết quốc tế" id="lien-ket" hasSub={true}>
          <SidebarSubItem label="Cử nhân liên kết quốc tế" path="/lien-ket-quoc-te" />
          <SidebarSubItem label="Song ngữ và trao đổi" path="/trao-doi-sinh-vien" />
        </SidebarItem>

        {/* Dynamic Majors/Specializations */}
        <SidebarItem label="Chuyên ngành đào tạo" id="chuyen-nganh" hasSub={true}>
           {majors.map(major => (
             <MajorItem key={major.id} major={major} />
           ))}
        </SidebarItem>

        <SidebarItem label="Học bổng và chế độ chính sách" path="/hoc-bong-chinh-sach" />
        <SidebarItem label="Tính kết quả học tập" path="/tinh-diem-xet-tuyen" />
        <SidebarItem label="Điểm chuẩn các năm" path="/tra-cuu-diem-chuan" />

        <div className="p-6 bg-white space-y-4 border-t border-gray-100">
           <div className="flex items-center gap-3">
             <div className="bg-[#1877f2] p-1.5 rounded-full">
               <Facebook className="w-5 h-5 text-white fill-current" />
             </div>
             <a href="https://facebook.com" className="text-[#00558d] font-bold text-[15px] hover:text-[#004a99]">Fanpage DUE</a>
           </div>
           
           <div className="flex items-start gap-3">
             <div className="bg-[#ff8a00] p-1.5 rounded-full mt-1">
               <Phone className="w-5 h-5 text-white fill-current" />
             </div>
              <div className="cursor-default">
                <p className="text-[#ff8a00] font-bold text-[15px] leading-tight">Hotline: 0236 3836 169</p>
              </div>
           </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
