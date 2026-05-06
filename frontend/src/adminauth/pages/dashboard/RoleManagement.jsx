import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';
import '../../../mastermodel/styles/MasterModel.css';
import ConfirmModal from '../../../mastermodel/components/ConfirmModal';
import roleService from '../../services/roleService';
import userService from '../../services/userService';

const RoleManagement = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesData, usersData] = await Promise.all([
        roleService.getRoles(),
        userService.getUsers()
      ]);
      setRoles(rolesData);
      setUsers(usersData.map(u => ({ 
        ...u, 
        name: u.userName || u.fullName,
        role: u.role?.roleName || u.role || 'User'
      })));
    } catch (error) {
      console.error('Error fetching role management data:', error);
    }
  };

  const handleAddRole = () => {
    navigate('/roles/create');
  };

  const handleEditRole = (role) => {
    navigate(`/roles/edit/${role.id}`);
  };

  const handleDeleteClick = (role) => {
    setRoleToDelete(role);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      try {
        await roleService.deleteRole(roleToDelete.id);
        setRoles(roles.filter(r => r.id !== roleToDelete.id));
        setIsModalOpen(false);
        setRoleToDelete(null);
      } catch (error) {
        alert('Failed to delete role: ' + error.message);
      }
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Role Management</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Define access control levels and permissions</p>
          </div>
          <button className="btn-agro btn-primary" onClick={handleAddRole} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <Plus size={16} /> Create Role
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {roles.map((role) => {
              const roleUsers = users.filter(u => u.role === role.roleName);
              return (
                <div
                  key={role.id}
                  onClick={() => handleEditRole(role)}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>{role.roleName}</h4>
                    {role.roleName !== 'Admin' && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(role); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {roleUsers.length > 0 ? (
                        roleUsers.map((u) => (
                          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13px', fontWeight: '600' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }}></div>
                            <span>Assigned: {u.name}</span>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>Not assigned to anyone</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <ConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title="Delete Access Role?" 
        message={`Are you sure you want to delete the ${roleToDelete?.roleName} role? This may affect users assigned to this role.`} 
      />
    </div>
  );
};

export default RoleManagement;
