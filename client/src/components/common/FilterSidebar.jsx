import PropTypes from 'prop-types';
import { FlatSelect, FlatCheckbox, PrimaryButton, SecondaryButton } from './index';

function FilterSidebar({ 
  filters = [],
  onFilterChange,
  onClearAll,
  onApply,
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-sm text-primary hover:text-primary-dark transition-colors font-semibold"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      <div className="space-y-6">
        {filters.map((filter, index) => (
          <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase">
              {filter.label}
            </h4>
            
            {filter.type === 'select' && (
              <FlatSelect
                value={filter.value}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                options={filter.options}
                placeholder={filter.placeholder}
              />
            )}

            {filter.type === 'checkbox' && (
              <div className="space-y-2">
                {filter.options.map((option, optIndex) => (
                  <FlatCheckbox
                    key={optIndex}
                    checked={filter.value?.includes(option.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...(filter.value || []), option.value]
                        : (filter.value || []).filter(v => v !== option.value);
                      onFilterChange(filter.key, newValue);
                    }}
                    label={option.label}
                  />
                ))}
              </div>
            )}

            {filter.type === 'range' && (
              <div className="space-y-2">
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  value={filter.value}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{filter.min}</span>
                  <span className="font-bold text-primary">{filter.value}</span>
                  <span>{filter.max}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {onApply && (
        <div className="mt-6 space-y-2">
          <PrimaryButton onClick={onApply} className="w-full">
            Áp dụng bộ lọc
          </PrimaryButton>
          {onClearAll && (
            <SecondaryButton onClick={onClearAll} className="w-full">
              Đặt lại
            </SecondaryButton>
          )}
        </div>
      )}
    </div>
  );
}

FilterSidebar.propTypes = {
  filters: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['select', 'checkbox', 'range']).isRequired,
    value: PropTypes.any,
    options: PropTypes.array,
    min: PropTypes.number,
    max: PropTypes.number,
    placeholder: PropTypes.string,
  })).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func,
  onApply: PropTypes.func,
  className: PropTypes.string,
};

export default FilterSidebar;
