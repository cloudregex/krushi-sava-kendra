import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, Save, X, ArrowLeft } from 'lucide-react';
import '../../../mastermodel/styles/MasterModel.css';
import roleService from '../../services/roleService';

const AVAILABLE_MODULES = [
  { id: 'product', name: 'Product' },
  { id: 'category', name: 'Category' },
  { id: 'customer', name: 'Customer' },
  { id: 'supplier', name: 'Supplier' },
  { id: 'sale', name: 'Sale' },
  { id: 'purchase', name: 'Purchase' },
  { id: 'tax', name: 'Tax' },
  { id: 'users', name: 'Users' },
  { id: 'roles', name: 'Roles' }
];

const RoleCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentRole, setCurrentRole] = useState({ roleName: '', permissions: {} });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchRole();
    }
  }, [id]);

  const fetchRole = async () => {
    try {
      const rolesData = await roleService.getRoles();
      const roleToEdit = rolesData.find(r => r.id === id);
      if (roleToEdit) {
        setCurrentRole(roleToEdit);
      }
    } catch (error) {
      console.error('Error fetching role:', error);
    }
  };

  const toggleAction = (moduleId, action) => {
    const perms = { ...currentRole.permissions };
    const currentActions = perms[moduleId] || [];

    if (currentActions.includes(action)) {
      perms[moduleId] = currentActions.filter(a => a !== action);
      if (perms[moduleId].length === 0) delete perms[moduleId];
    } else {
      perms[moduleId] = [...currentActions, action];
    }
    setCurrentRole({ ...currentRole, permissions: perms });
  };

  const toggleAllModuleActions = (moduleId) => {
    const perms = { ...currentRole.permissions };
    const allActions = ['view', 'create', 'edit', 'delete'];
    const currentActions = perms[moduleId] || [];

    if (currentActions.length === allActions.length) {
      delete perms[moduleId];
    } else {
      perms[moduleId] = allActions;
    }
    setCurrentRole({ ...currentRole, permissions: perms });
  };

  const handleSave = async () => {
    if (!currentRole.roleName) {
      setError('Role name is required');
      return;
    }

    try {
      if (id) {
        await roleService.updateRole(id, currentRole);
      } else {
        await roleService.createRole(currentRole);
      }
      navigate('/roles');
    } catch (error) {
      setError(error.message || 'Failed to save role');
    }
  };

  return (
    <div className="agro-container">
      <div className="agro-unified-card">
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>{id ? 'Edit Role' : 'Create New Role'}</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>{id ? 'Modify existing system permissions' : 'Define new access control levels'}</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate('/roles')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back to List
          </button>
        </div>

        <div style={{ padding: window.innerWidth < 768 ? '15px' : '25px' }}>
          <div style={{ background: '#f8fafc', padding: window.innerWidth < 768 ? '15px' : '25px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: window.innerWidth < 768 ? '20px' : '25px', color: 'var(--primary)' }}>
              <ShieldCheck size={20} />
              <h3 style={{ fontSize: window.innerWidth < 768 ? '15px' : '16px', margin: 0, fontWeight: '700' }}>Role Specifications</h3>
            </div>
            
            <div className="form-group" style={{ maxWidth: window.innerWidth < 768 ? '100%' : '400px' }}>
              <label style={{ fontSize: '12px', marginBottom: '6px' }}>Role Name</label>
              <input 
                type="text" 
                className="form-control" 
                style={{ height: window.innerWidth < 768 ? '45px' : '40px', fontSize: '14px' }} 
                placeholder="e.g. Accountant, Sales Executive" 
                value={currentRole.roleName} 
                onChange={(e) => setCurrentRole({ ...currentRole, roleName: e.target.value })} 
              />
            </div>

            <div style={{ marginTop: window.innerWidth < 768 ? '25px' : '30px' }}>
              <label style={{ fontSize: window.innerWidth < 768 ? '12px' : '13px', fontWeight: '800', marginBottom: '20px', display: 'block', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Module-wise Permissions
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {AVAILABLE_MODULES.map((module) => {
                  const modulePerms = currentRole.permissions[module.id] || [];
                  const isAll = modulePerms.length === 4;
                  return (
                    <div key={module.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                        <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--primary)' }}>{module.name}</span>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer', color: '#64748b', fontWeight: '600' }}>
                          <input type="checkbox" checked={isAll} onChange={() => toggleAllModuleActions(module.id)} style={{ accentColor: 'var(--primary)' }} /> Select All
                        </label>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {[
                          { id: 'view', label: 'View Access' },
                          { id: 'create', label: 'Create/Add' },
                          { id: 'edit', label: 'Edit/Update' },
                          { id: 'delete', label: 'Delete' }
                        ].map((action) => (
                          <label key={action.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '12px', color: '#475569', fontWeight: '500' }}>
                            <input 
                              type="checkbox" 
                              checked={modulePerms.includes(action.id)} 
                              onChange={() => toggleAction(module.id, action.id)} 
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} 
                            />
                            {action.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '20px 0', fontWeight: '600' }}>{error}</p>}

            <div style={{ 
              display: 'flex', 
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              gap: '15px', 
              marginTop: '35px', 
              paddingTop: '25px', 
              borderTop: '1px solid #e2e8f0' 
            }}>
              <button className="btn-agro btn-primary" onClick={handleSave} style={{ height: '42px', padding: '0 30px', fontSize: '14px', width: window.innerWidth < 768 ? '100%' : 'auto' }}>
                <Save size={18} /> {id ? 'Update Role' : 'Create Role'}
              </button>
              <button className="btn-agro btn-outline" onClick={() => navigate('/roles')} style={{ height: '42px', padding: '0 30px', fontSize: '14px', width: window.innerWidth < 768 ? '100%' : 'auto' }}>
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleCreate;
