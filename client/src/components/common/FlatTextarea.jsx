import PropTypes from 'prop-types';

function FlatTextarea({ 
  value, 
  onChange, 
  placeholder, 
  label,
  error,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-4 py-3 
          border border-gray-300 
          bg-white
          text-gray-800
          placeholder-gray-400
          focus:outline-none 
          focus:border-primary
          disabled:bg-gray-100 
          disabled:cursor-not-allowed
          transition-colors duration-200
          resize-vertical
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

FlatTextarea.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default FlatTextarea;
