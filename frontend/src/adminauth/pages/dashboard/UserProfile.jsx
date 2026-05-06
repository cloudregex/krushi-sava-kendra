import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Key, Clock, Calendar, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();
  const [profileImage, setProfileImage] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    alert('User Profile updated successfully!');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agro-container"
      style={{ padding: '20px' }}
    >
      <style>
        {`
          .profile-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
          }

          @media (max-width: 1024px) {
            .profile-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 768px) {
            .profile-header {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 10px;
            }
            .system-info-grid {
              grid-template-columns: 1fr !important;
            }
            .security-item {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 15px;
            }
            .security-item button {
              width: 100%;
            }
          }
        `}
      </style>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }} className="profile-header">
          <User size={32} /> User Profile
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Manage your personal account details</p>
      </div>

      <div className="profile-grid">
        {/* Left Column - User Info Card */}
        <div className="agro-unified-card" style={{ padding: '30px', textAlign: 'center', background: 'white' }}>
          <div style={{ 
            width: '150px', 
            height: '150px', 
            borderRadius: '50%', 
            background: 'var(--background)', 
            margin: '0 auto 20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            position: 'relative',
            border: '2px dashed var(--primary)',
            overflow: 'hidden'
          }}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '60px',
                fontWeight: '800'
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <label style={{ 
              position: 'absolute', 
              bottom: '5px', 
              right: '5px', 
              background: 'white', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--primary)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              border: '1px solid #eee',
              zIndex: 10
            }}>
              <Camera size={20} />
              <input type="file" style={{ display: 'none' }} onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{user?.name}</h3>
          <div style={{ 
            display: 'inline-block', 
            marginBottom: '20px',
            background: 'var(--primary-soft)',
            color: 'var(--primary)',
            padding: '4px 12px',
            borderRadius: '99px',
            fontSize: '12px',
            fontWeight: '800'
          }}>
            {user?.role?.toUpperCase()}
          </div>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'left' }}>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>{user?.email || 'No email provided'}</span>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>Role: {user?.role}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Account Settings */}
        <div className="agro-unified-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ marginBottom: '25px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Edit Profile Information</h4>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label>Profile Image</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <label 
                  style={{ 
                    flex: 1,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    padding: '12px 15px', 
                    border: '2px dashed var(--border)', 
                    borderRadius: '12px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: 'var(--text-muted)',
                    transition: 'all 0.3s ease',
                    background: '#fafafa'
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-soft)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fafafa'; }}
                >
                  <Camera size={18} color="var(--primary)" />
                  <span>{profileImage ? 'Change Profile Picture' : 'Upload Profile Picture'}</span>
                  <input 
                    type="file" 
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </label>
                {profileImage && (
                  <button 
                    type="button" 
                    onClick={() => setProfileImage(null)}
                    style={{ padding: '12px 18px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '12px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: '0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseOut={e => e.currentTarget.style.background = '#fef2f2'}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <button type="submit" className="btn-agro btn-primary" style={{ width: '100%' }}>
                Update Profile
              </button>
            </div>
          </form>

          <div style={{ marginTop: '40px' }}>
            <h4 style={{ marginBottom: '25px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Account Security</h4>
            <div className="security-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--background)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px' }}>
                  <Key size={20} color="#3b82f6" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>Change Password</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Update your account password regularly</p>
                </div>
              </div>
              <button className="btn-agro" style={{ padding: '8px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                Update
              </button>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h4 style={{ marginBottom: '20px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>System Info</h4>
            <div className="system-info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Joined Date</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="var(--primary)" />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Jan 01, 2024</span>
                </div>
              </div>
              <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Last Login</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="var(--info)" />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;
