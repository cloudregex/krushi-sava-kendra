import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Key, Clock, Calendar, X, Save, History, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logs, setLogs] = useState([]);
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

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await profileService.getMyLogs();
      setLogs(data);
      setShowLogsModal(true);
    } catch (error) {
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const formatLogDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
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
          .log-item { padding: 12px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 15px; }
          .log-item:last-child { border-bottom: none; }
          @media (max-width: 1024px) { .profile-grid { grid-template-columns: 1fr; } }
          @media (max-width: 768px) {
            .profile-header { flex-direction: column; align-items: flex-start !important; gap: 10px; }
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
        {/* Left Column - User Info */}
        <div className="agro-unified-card" style={{ padding: '30px', textAlign: 'center', background: 'white', alignSelf: 'start' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', 
            margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '36px', fontWeight: '800'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{user?.name}</h3>
          <div style={{ 
            display: 'inline-block', marginBottom: '20px', background: 'var(--primary-soft)',
            color: 'var(--primary)', padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '800'
          }}>
            {user?.role?.toUpperCase()}
          </div>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', textAlign: 'left' }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '13px' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={14} color="var(--text-muted)" />
              <span style={{ fontSize: '13px' }}>{user?.role} Access</span>
            </div>
          </div>
        </div>

        {/* Right Column - Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Security Card */}
          <div className="agro-unified-card" style={{ padding: '25px', background: 'white' }}>
            <h4 style={{ marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Key size={18} /> Account Security
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {!showPasswordForm ? (
                <div className="security-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>Change Password</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Last updated: Not recently</p>
                  </div>
                  <button className="btn-agro btn-outline" onClick={() => setShowPasswordForm(true)} style={{ padding: '6px 15px', fontSize: '12px' }}>
                    Update
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordUpdate} style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Current Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        required 
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        required 
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        required 
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button type="submit" className="btn-agro btn-primary" disabled={loading} style={{ flex: 1, height: '36px', fontSize: '13px' }}>
                        {loading ? 'Updating...' : 'Save Password'}
                      </button>
                      <button type="button" className="btn-agro btn-outline" onClick={() => setShowPasswordForm(false)} style={{ flex: 1, height: '36px', fontSize: '13px' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <div className="security-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>System Activity Logs</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Track all your actions in the system</p>
                </div>
                <button className="btn-agro btn-outline" onClick={fetchLogs} disabled={loading} style={{ padding: '6px 15px', fontSize: '12px' }}>
                  {loading ? 'Loading...' : 'View Logs'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Modal */}
      <AnimatePresence>
        {showLogsModal && (
          <div style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
          }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            >
              <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
                  <History size={20} color="var(--primary)" /> Activity History
                </h3>
                <button onClick={() => setShowLogsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                {logs.length > 0 ? logs.map((log) => (
                  <div key={log.id} className="log-item">
                    <div style={{ 
                      padding: '8px', 
                      background: log.action === 'CREATE' ? '#f0fdf4' : log.action === 'UPDATE' ? '#eff6ff' : '#fef2f2',
                      borderRadius: '8px',
                      color: log.action === 'CREATE' ? '#16a34a' : log.action === 'UPDATE' ? '#3b82f6' : '#ef4444'
                    }}>
                      {log.action === 'CREATE' ? <Plus size={16} /> : log.action === 'UPDATE' ? <Save size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>{log.action} - {log.module}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{log.details}</p>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '11px', color: '#94a3b8' }}>
                      {formatLogDate(log.createdAt)}
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No activity logs found.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserProfile;
