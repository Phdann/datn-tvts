import PropTypes from 'prop-types';
import { useState } from 'react';

function FlatTabs({ tabs = [], defaultTab = 0, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className}>
      <div className="border-b border-gray-300">
        <div className="flex space-x-0">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                px-6 py-3
                font-semibold
                border-b-4
                transition-colors
                ${activeTab === index
                  ? 'border-primary text-primary bg-gray-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="py-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}

FlatTabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    content: PropTypes.node.isRequired,
  })).isRequired,
  defaultTab: PropTypes.number,
  className: PropTypes.string,
};

export default FlatTabs;
