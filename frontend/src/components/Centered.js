import React from 'react';
export function Centered(props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        MozTransform: 'translateX(-50%) translateY(-50%)',
        WebkitTransform: 'translateX(-50%) translateY(-50%)',
        transform: 'translateX(-50%) translateY(-50%)',
        textAlign: 'center'
      }}
    >
      {props.children}
    </div>
  );
}
