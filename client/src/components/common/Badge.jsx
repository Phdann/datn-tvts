import PropTypes from 'prop-types';

function Badge({ 
  children,
  variant = 'default',
  size = 'md', 
  className = '',
  ...props 
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800 border-gray-300',
    primary: 'bg-primary text-white border-primary',
    success: 'bg-green-600 text-white border-green-600',
    warning: 'bg-yellow-500 text-white border-yellow-500',
    error: 'bg-red-600 text-white border-red-600',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-block
        border
        font-bold
        uppercase
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'error']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Badge;
