import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Key, Clock, Calendar, X, Save, History, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      await profileService.updatePassword(passwords.current, passwords.new);
      toast.success("Password updated successfully!");
      setShowPasswordForm(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = () => {
    navigate('/activity-logs');
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
          .profile-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 30px; }
          @media (max-width: 1024px) { .profile-grid { grid-template-columns: 1fr; } }
          @media (max-width: 768px) {
            .profile-header { flex-direction: column; align-items: flex-start !important; gap: 10px; }
            .system-info-grid { grid-template-columns: 1fr !important; }
            .security-item { flex-direction: column; align-items: flex-start !important; gap: 15px; }
            .security-item button { width: 100%; }
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
            width: '120px', height: '120px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary) 0%, #166534 100%)', 
            margin: '0 auto 25px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '56px', fontWeight: '800', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '4px solid white'
          }}>
            {user?.name?.charAt(0).toUpperCase() || user?.fullName?.charAt(0).toUpperCase() || user?.userName?.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{user?.name || user?.fullName}</h3>
          <div style={{ 
            display: 'inline-block', marginBottom: '20px', background: 'var(--primary-soft)',
            color: 'var(--primary)', padding: '4px 12px', borderRadius: '99px',
            fontSize: '12px', fontWeight: '800'
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
              <span style={{ fontSize: '14px', color: 'var(--text-main)' }}>Role: {user?.role} Access</span>
            </div>
          </div>
        </div>

        {/* Right Column - Account Settings */}
        <div className="agro-unified-card" style={{ padding: '30px', background: 'white' }}>
          <h4 style={{ marginBottom: '25px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Account Security</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Password Section */}
            {!showPasswordForm ? (
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
                <button className="btn-agro" onClick={() => setShowPasswordForm(true)} style={{ padding: '8px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                  Update
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordUpdate} style={{ background: 'var(--background)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Current Password</label>
                    <input type="password" className="form-control" required value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>New Password</label>
                    <input type="password" className="form-control" required value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '12px', marginBottom: '5px', display: 'block' }}>Confirm New Password</label>
                    <input type="password" className="form-control" required value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button type="submit" className="btn-agro btn-primary" disabled={loading} style={{ flex: 1, height: '36px', fontSize: '13px' }}>
                      {loading ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn-agro btn-outline" onClick={() => setShowPasswordForm(false)} style={{ flex: 1, height: '36px', fontSize: '13px' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Activity Logs Section */}
            <div className="security-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--background)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
                  <Clock size={20} color="#10b981" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>Session Activity</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>View your recent actions and history</p>
                </div>
              </div>
              <button className="btn-agro" onClick={handleViewLogs} style={{ padding: '8px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                View Logs
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
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>May 01, 2026</span>
                </div>
              </div>
              <div style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: 'var(--text-muted)' }}>Account Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={14} color="var(--info)" />
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>Active</span>
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
