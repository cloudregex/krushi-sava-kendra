import React from 'react';
import { X } from 'lucide-react';

const AdminModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="page-header" style={{ marginBottom: '24px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>{title}</h2>
          <button 
            onClick={onClose} 
            className="btn-agro btn-outline" 
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
