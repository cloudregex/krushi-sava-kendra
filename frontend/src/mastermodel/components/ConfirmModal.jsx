import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
    >
      <div 
        className="agro-card" 
        style={{ 
          maxWidth: '450px', 
          width: '100%',
          padding: '40px', 
          textAlign: 'center', 
          position: 'relative',
          margin: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ 
          background: '#fef2f2', 
          width: '70px', 
          height: '70px', 
          borderRadius: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 25px' 
        }}>
          <AlertTriangle size={36} color="var(--danger)" />
        </div>
        
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 12px' }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: '0 0 30px', lineHeight: '1.6' }}>{message}</p>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-agro btn-outline" style={{ flex: 1, padding: '12px' }} onClick={onClose}>
            No, Cancel
          </button>
          <button 
            className="btn-agro" 
            style={{ 
              flex: 1, 
              padding: '12px',
              background: 'var(--danger)', 
              color: 'white',
              fontWeight: '700',
              borderRadius: '12px',
              border: 'none'
            }} 
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ConfirmModal;
