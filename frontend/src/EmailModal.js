import React from 'react';

const Modal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>x</button>
        <h2>{content.subject}</h2>
        <p>{content.from}</p>
        <pre>{content.body.replace(/\s+/g, ' ')}</pre>
      </div>
    </div>
  );
};

export default Modal;