import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Key, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '40px' }}
    >
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
          <User size={32} /> User Profile
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Manage your personal account details</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column - User Info Card */}
        <div className="glass-card" style={{ padding: '30px', textAlign: 'center', background: 'white' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: 'var(--primary)', 
            margin: '0 auto 20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: '800'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)' }}>{user?.name}</h3>
          <div className="badge badge-success" style={{ display: 'inline-block', marginBottom: '20px' }}>
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
        <div className="glass-card" style={{ padding: '40px', background: 'white' }}>
          <h4 style={{ marginBottom: '25px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Account Security</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--background)', borderRadius: '12px' }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'var(--background)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px' }}>
                  <Clock size={20} color="#10b981" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>Session Activity</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>View your recent login history</p>
                </div>
              </div>
              <button className="btn-agro" style={{ padding: '8px 20px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>
                View Logs
              </button>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h4 style={{ marginBottom: '20px', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>System Info</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
