import React from 'react';
import AdminModal from './AdminModal';

const ViewDetailsModal = ({ isOpen, onClose, title, data, fields }) => {
  if (!data) return null;

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {fields.map((field, index) => (
          <div key={index} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600', marginBottom: '4px' }}>
              {field.label}
            </label>
            <div style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
              {field.render ? field.render(data) : data[field.accessor] || 'N/A'}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-agro btn-primary" onClick={onClose}>Close Details</button>
      </div>
    </AdminModal>
  );
};

export default ViewDetailsModal;
