import React from 'react';

const FilterButtons = ({ options, selectedValue, onChange, 'aria-label': ariaLabel }) => {
  return (
    <div className="flex gap-[10px] mb-[20px] justify-center flex-wrap" role="group" aria-label={ariaLabel}>
      {options.map(option => (
        <button
          key={option.value}
          className={`py-[8px] px-[16px] border rounded-[20px] cursor-pointer transition-all duration-300 text-[0.9rem] font-medium hover:bg-[#f0f0f0] hover:border-[#adadad] ${selectedValue === option.value ? 'bg-[#8b4513] text-white border-[#8b4513] shadow-[0_2px_5px_rgba(0,0,0,0.15)]' : 'bg-white text-[#333] border-[#ccc]'}`}
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
