import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save, X, User, Mail, Lock, Shield, Edit3 } from 'lucide-react';
import { STORAGE_KEYS, getFromStorage, setToStorage, initializeStorage } from '../../utils/storage';
import FormField from '../../../mastermodel/components/FormField';
import SearchableSelect from '../../../mastermodel/components/SearchableSelect';
import '../../../mastermodel/styles/MasterModel.css';

const UserCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    initializeStorage();
    const savedRoles = getFromStorage(STORAGE_KEYS.ROLES) || [];
    setRoles(savedRoles.filter(r => r.roleName !== 'Admin').map(r => r.roleName));

    if (id) {
      const users = getFromStorage(STORAGE_KEYS.USERS) || [];
      const userToEdit = users.find(u => u.id === id);
      if (userToEdit) {
        setFormData({
          name: userToEdit.name,
          email: userToEdit.email,
          password: userToEdit.password,
          role: userToEdit.role
        });
      }
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.role) {
      setError('Please select a role');
      return;
    }

    const currentUsers = getFromStorage(STORAGE_KEYS.USERS) || [];
    
    // Email uniqueness check (skip for current user being edited)
    if (currentUsers.some(u => u.email === formData.email && u.id !== id)) {
      setError('Email address already registered');
      return;
    }

    let updatedUsers;
    if (id) {
      updatedUsers = currentUsers.map(u => u.id === id ? { ...u, ...formData } : u);
    } else {
      const userToAdd = { 
        ...formData, 
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      updatedUsers = [...currentUsers, userToAdd];
    }
    
    setToStorage(STORAGE_KEYS.USERS, updatedUsers);
    navigate('/users');
  };

  return (
    <div className="agro-container" style={{ padding: '25px 25px 0 25px' }}>
      <form onSubmit={handleSave} className="agro-unified-card" style={{ 
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>{id ? 'Update User Account' : 'Create New User Account'}</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>{id ? 'Modify access roles and system permissions' : 'Assign access roles and system permissions'}</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/users')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0', color: 'var(--primary)' }}>
              <User size={16} />
              <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Account Information</h3>
            </div>

            <FormField 
              label="Full Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="Enter employee full name" 
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <FormField 
                label="Email Address" 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                required 
                placeholder="e.g. employee@agro.com" 
              />
              <FormField 
                label="Initial Password" 
                name="password" 
                type="password"
                value={formData.password} 
                onChange={handleChange} 
                required 
                placeholder="Minimum 6 characters" 
              />
            </div>

            <div style={{ marginTop: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0', color: 'var(--primary)' }}>
                <Shield size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Access Permissions</h3>
              </div>
              <SearchableSelect 
                label="System Access Role" 
                options={roles} 
                value={formData.role} 
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))} 
                required 
                placeholder="Select a functional role"
              />
            </div>

            {error && (
              <div style={{ padding: '10px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: '600', marginTop: '10px' }}>
                {error}
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          padding: '10px 20px', 
          background: '#f8fafc', 
          borderTop: '1px solid var(--border-light)', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px' 
        }}>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/users')} style={{ height: '36px', minWidth: '100px', fontSize: '13px' }}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary" style={{ height: '36px', minWidth: '160px', fontSize: '13px' }}>
            {id ? <Save size={16} /> : <UserPlus size={16} />} 
            <span style={{ marginLeft: '8px' }}>{id ? 'Update Account' : 'Create Account'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserCreate;
