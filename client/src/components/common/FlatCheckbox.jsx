import PropTypes from 'prop-types';

function FlatCheckbox({ 
  checked, 
  onChange, 
  label,
  disabled = false,
  className = '',
  ...props 
}) {
  return (
    <label className={`flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="
          w-5 h-5
          border-2 border-gray-300
          bg-white
          checked:bg-primary checked:border-primary
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          disabled:cursor-not-allowed
          transition-colors duration-200
          cursor-pointer
        "
        {...props}
      />
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-800">{label}</span>
      )}
    </label>
  );
}

FlatCheckbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default FlatCheckbox;
