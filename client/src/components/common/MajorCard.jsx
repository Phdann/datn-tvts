import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { GraduationCap, DollarSign, Users } from 'lucide-react';


function MajorCard({ 
  id,
  code,
  name, 
  tuition,
  quota,
  faculty,
  className = '',
  ...props 
}) {
  return (
    <Link
      to={`/nganh-dao-tao/${id}`}
      className={`
        block
        bg-white 
        border border-gray-200
        hover:border-primary
        transition-colors
        ${className}
      `}
      {...props}
    >
      <div className="bg-primary p-4 border-b border-gray-200">
        <span className="inline-block px-3 py-1 bg-white text-primary text-xs font-bold uppercase mb-2">
          {code}
        </span>
        <h3 className="text-lg font-bold text-white">
          {name}
        </h3>
        {faculty && (
          <p className="text-sm text-blue-100 mt-1">{faculty}</p>
        )}
      </div>
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm">Học phí/năm</span>
            </div>
            <span className="font-bold text-primary">
              {new Intl.NumberFormat('vi-VN').format(tuition)} đ
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span className="text-sm">Chỉ tiêu</span>
            </div>
            <span className="font-bold text-green-600">{quota} SV</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center text-primary font-semibold text-sm">
            <GraduationCap className="h-4 w-4 mr-2" />
            Xem chi tiết →
          </div>
        </div>
      </div>
    </Link>
  );
}

MajorCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  tuition: PropTypes.number.isRequired,
  quota: PropTypes.number.isRequired,
  faculty: PropTypes.string,
  className: PropTypes.string,
};

export default MajorCard;
