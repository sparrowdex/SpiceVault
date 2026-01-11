import React from 'react';
import './FilterButtons.css';

const FilterButtons = ({ options, selectedValue, onChange, 'aria-label': ariaLabel }) => {
  return (
    <div className="filter-button-group" role="group" aria-label={ariaLabel}>
      {options.map(option => (
        <button
          key={option.value}
          className={`filter-button ${selectedValue === option.value ? 'active' : ''}`}
          onClick={() => onChange(option.value)}
          aria-pressed={selectedValue === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
