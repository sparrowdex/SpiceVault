import React from 'react';

const BackgroundGradient = ({ children }) => {
  const style = {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #FFE6CC, #FFCC99)', // slightly darker light orange gradient
    backgroundSize: '100% 100vh',
    backgroundRepeat: 'no-repeat',
    animation: 'none',
  };

  return <div style={style}>{children}</div>;
};

export default BackgroundGradient;
