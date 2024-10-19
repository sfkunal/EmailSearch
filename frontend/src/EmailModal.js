import React from 'react';

const Modal = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose}>Close</button>
        <h2>{content.subject}</h2>
        <p>To: {content.to}</p>
        <p>From: {content.from}</p>
        <p>Body:</p>
        <pre>{content.body}</pre>
      </div>
    </div>
  );
};

export default Modal;