import PropTypes from 'prop-types';

function SecondaryButton({ 
  children, 
  onClick, 
  type = 'button',
  disabled = false,
  className = '',
  ...props 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3
        bg-white text-primary
        border-2 border-primary
        font-semibold
        hover:bg-gray-50
        focus:outline-none
        focus:ring-2 focus:ring-primary focus:ring-offset-2
        disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

SecondaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default SecondaryButton;
