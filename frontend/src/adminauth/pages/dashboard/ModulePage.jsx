  import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Lock } from 'lucide-react';

import '../../../mastermodel/styles/MasterModel.css';

const ModulePage = ({ title, module }) => {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission(module, 'create');
  const canView = hasPermission(module, 'view');

  if (!canView) {
    return (
      <div className="agro-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '40px', background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border-light)' }}>
          <div style={{ background: '#fef2f2', color: '#ef4444', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Lock size={40} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>Access Denied</h2>
          <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>You do not have the required permissions to access the <strong>{title}</strong> module. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agro-container" style={{ padding: '0 25px' }}>
      <div className="agro-unified-card" style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-light)',
        marginTop: '5px',
        overflow: 'hidden'
      }}>
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>{title} Module</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Management and oversight for {title}</p>
          </div>
          {canCreate && (
            <button className="btn-agro btn-primary" style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <Plus size={16} /> Create New
            </button>
          )}
        </div>

        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-light)', maxWidth: '600px', margin: '0 auto' }}>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
              Welcome to the <strong>{title}</strong> module. This section is currently under active development.
              Only users with <strong>{module}:view</strong> permissions can see this view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;
