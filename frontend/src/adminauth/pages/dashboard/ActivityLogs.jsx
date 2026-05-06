import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Plus, Save, X, User, Clock, Search, Filter, AlertCircle, RefreshCcw } from 'lucide-react';
import profileService from '../../services/profileService';
import { toast } from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';

const ActivityLogs = () => {
  const { user: currentUser } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // If user is superadmin, fetch all logs. Otherwise fetch only their own logs.
      const isAdmin = currentUser?.role === 'superadmin';
      const data = isAdmin 
        ? await profileService.getAllLogs() 
        : await profileService.getMyLogs();
      setLogs(data);
    } catch (error) {
      toast.error("Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionStyles = (action) => {
    switch (action) {
      case 'CREATE': return { bg: '#f0fdf4', text: '#16a34a', icon: <Plus size={16} /> };
      case 'UPDATE': return { bg: '#eff6ff', text: '#3b82f6', icon: <Save size={16} /> };
      case 'DELETE': return { bg: '#fef2f2', text: '#ef4444', icon: <X size={16} /> };
      case 'LOGIN': return { bg: '#fefce8', text: '#ca8a04', icon: <User size={16} /> };
      default: return { bg: '#f8fafc', text: '#64748b', icon: <Clock size={16} /> };
    }
  };

  const formatLogDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    if (!log) return false;
    const moduleName = log.module || '';
    const detailsText = log.details || '';
    
    const matchesSearch = moduleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         detailsText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || log.action === filter;
    return matchesSearch && matchesFilter;
  }) : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="agro-container"
      style={{ padding: '20px' }}
    >
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <History size={32} /> Activity Logs
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Track your recent actions across the system</p>
        </div>
        <button className="btn-agro btn-outline" onClick={fetchLogs} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="agro-unified-card" style={{ background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
        {/* Filters Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="form-control"
              style={{ paddingLeft: '40px', borderRadius: '10px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-control" 
            style={{ width: '150px', borderRadius: '10px' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
          </select>
        </div>

        <div style={{ padding: '0' }}>
          {loading ? (
            <div style={{ padding: '100px', textAlign: 'center', color: '#94a3b8' }}>Loading logs...</div>
          ) : filteredLogs.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Action</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Done By</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Module</th>
                    <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '13px', color: '#64748b' }}>Details</th>
                    <th style={{ padding: '15px 20px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    if (!log) return null;
                    const styles = getActionStyles(log.action);
                    return (
                      <tr key={log.id || Math.random()} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              width: '32px', height: '32px', borderRadius: '8px', 
                              background: styles?.bg || '#f8fafc', color: styles?.text || '#64748b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {styles?.icon || <Clock size={16} />}
                            </div>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: styles?.text || '#64748b' }}>{log.action || 'UNKNOWN'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>
                              {(log.userName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500' }}>{log.userName || 'Unknown'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>
                          {log.module || 'N/A'}
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '13px', color: '#64748b' }}>
                          {log.details || 'No details'}
                        </td>
                        <td style={{ padding: '15px 20px', textAlign: 'right', fontSize: '12px', color: '#94a3b8' }}>
                          {log.createdAt ? formatLogDate(log.createdAt) : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '100px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '20px', background: '#f8fafc', borderRadius: '50%', marginBottom: '20px' }}>
                <History size={48} color="#94a3b8" />
              </div>
              <p style={{ margin: 0, color: '#64748b', fontWeight: '600', fontSize: '18px' }}>No logs found</p>
              <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Try changing your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityLogs;
