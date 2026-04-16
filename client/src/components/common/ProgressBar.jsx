import PropTypes from 'prop-types';

function ProgressBar({ 
  value = 0, 
  max = 100,
  label,
  showPercentage = true,
  color = 'primary', // 'primary', 'success', 'warning', 'error'
  className = '',
  ...props 
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    primary: 'bg-primary',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    error: 'bg-red-600',
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-semibold text-gray-800">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className="w-full h-3 bg-gray-200 border border-gray-300">
        <div
          className={`h-full ${colors[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  label: PropTypes.string,
  showPercentage: PropTypes.bool,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'error']),
  className: PropTypes.string,
};

export default ProgressBar;
