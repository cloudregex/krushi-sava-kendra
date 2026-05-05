import React, { useState, useEffect } from 'react';
import { STORAGE_KEYS, getFromStorage, setToStorage, initializeStorage } from '../../utils/storage';
import { Users, UserPlus, Trash2, Shield, Edit3 } from 'lucide-react';

import '../../../mastermodel/styles/MasterModel.css';

import { useNavigate } from 'react-router-dom';

import ConfirmModal from '../../../mastermodel/components/ConfirmModal';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    initializeStorage();
    setUsers(getFromStorage(STORAGE_KEYS.USERS) || []);
  }, []);

  const handleDeleteClick = (user) => {
    if (user.role === 'Admin') {
      alert('Cannot delete Admin account');
      return;
    }
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      const currentUsers = getFromStorage(STORAGE_KEYS.USERS) || [];
      const updatedUsers = currentUsers.filter(u => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setToStorage(STORAGE_KEYS.USERS, updatedUsers);
      setIsModalOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="agro-container" style={{ padding: '25px 25px 0 25px' }}>
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
          padding: '15px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>User Management</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Manage accounts and assign access roles</p>
          </div>
          <button className="btn-agro btn-primary" onClick={() => navigate('/users/create')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <UserPlus size={16} /> Create User
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
            <table className="agro-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Email</th>
                  <th>Access Role</th>
                  <th style={{ textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          {u.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '13px' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>{u.email}</td>
                    <td>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: u.role === 'Admin' ? '#fef3c7' : '#f1f5f9',
                        color: u.role === 'Admin' ? '#d97706' : 'var(--primary)',
                        border: `1px solid ${u.role === 'Admin' ? '#fde68a' : '#e2e8f0'}`
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      {u.role !== 'Admin' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button onClick={() => navigate(`/users/edit/${u.id}`)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '5px' }}>
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDeleteClick(u)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
        title="Delete User Account?" 
        message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`} 
      />
    </div>
  );
};

export default UserManagement;
