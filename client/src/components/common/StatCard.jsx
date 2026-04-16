import PropTypes from 'prop-types';

function StatCard({ 
  icon: Icon, 
  value, 
  label,
  iconColor = 'text-primary',
  className = '',
  ...props 
}) {
  return (
    <div 
      className={`
        bg-white 
        border border-gray-200
        p-6
        ${className}
      `}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        {Icon && <Icon className={`h-8 w-8 ${iconColor}`} />}
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      </div>
      <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</p>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  iconColor: PropTypes.string,
  className: PropTypes.string,
};

export default StatCard;
