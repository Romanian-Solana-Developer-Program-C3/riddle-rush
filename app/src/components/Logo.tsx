import React from 'react';

const Logo: React.FC = () => {
  return (
    <div style={{
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      padding: '10px 0',
    }}>
      <img 
        src="/riddle-rush.jpg" 
        alt="RiddleRush Logo" 
        style={{
          height: '100%',
          width: 'auto',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default Logo; 