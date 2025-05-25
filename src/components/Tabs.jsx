import React from 'react';

export function Tabs({ active, setActive }) {
  return (
    <>
      {['Register Patient', 'View All Patients', 'SQL Console'].map((label, index) => (
        <button
          key={label}
          className={`tab-button ${active === index ? 'active' : ''}`}
          onClick={() => setActive(index)}
        >
          {label}
        </button>
      ))}
    </>
  );
}