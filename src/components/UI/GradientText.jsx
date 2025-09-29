import React from 'react';

const GradientText = ({ children, className = '' }) => {
  return (
    <span className={`bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
};

export default GradientText;