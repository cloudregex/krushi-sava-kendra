import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Search, AlertCircle, Calendar, User, FileText, IndianRupee, Eye, Printer, Edit, Trash2 } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import toast from 'react-hot-toast';

import '../mastermodel/styles/MasterModel.css';

const PurchaseReturn = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAll('purchase-returns');
      setReturns(data || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast.error("Failed to load purchase returns");
    } finally {
      setLoading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  const handleDelete = (id) => {
    setConfirmModal({ show: true, id });
  };

  const confirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ show: false, id: null });
    try {
      await ApiService.delete('purchase-returns', id);
      toast.success("Purchase return deleted successfully");
      fetchReturns();
    } catch (error) {
      console.error("Error deleting return:", error);
      toast.error("Failed to delete return");
    }
  };

  const handlePrint = (id) => {
    const iframeId = 'print-iframe';
    let iframe = document.getElementById(iframeId);
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.display = 'none';
    iframe.src = `/purchase/returns/view/${id}?print=true&quiet=true`;
    document.body.appendChild(iframe);
    toast.loading("Preparing print...", { duration: 2000 });
  };

  const filteredReturns = returns.filter(r =>
    String(r.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.purchaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.supplierId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="agro-container">
      <div className="agro-unified-card">
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 25px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div style={{ flexShrink: 0 }}>
            <h2 style={{ marginBottom: '2px', fontSize: '20px', color: '#ef4444' }}>Purchase Returns</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Record and manage returned items to suppliers</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search returns..."
                className="form-control"
                style={{ paddingLeft: '15px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button className="btn-agro btn-primary" onClick={() => navigate('/purchase/returns/new')} style={{ height: '38px', padding: '0 16px', background: '#ef4444' }}>
            <RotateCcw size={18} /> New Return
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReturns.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: '#ef4444' }}>{item.returnNo || item.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.Supplier?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {item.supplierId}</div>
                    </td>
                    <td>{item.returnDate}</td>
                    <td style={{ fontWeight: '700' }}>₹{(parseFloat(item.grandTotal) || 0).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        <AlertCircle size={14} color="#f59e0b" />
                        {item.reason}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn-action view"
                          title="View"
                          onClick={() => navigate(`/purchase/returns/view/${item.id}`)}
                          style={{ color: '#3b82f6', background: '#eff6ff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-action print"
                          title="Print"
                          onClick={() => handlePrint(item.id)}
                          style={{ color: '#10b981', background: '#ecfdf5', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          className="btn-action edit"
                          title="Edit"
                          onClick={() => navigate(`/purchase/returns/edit/${item.id}`)}
                          style={{ color: '#f59e0b', background: '#fffbeb', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-action delete"
                          title="Delete"
                          onClick={() => handleDelete(item.id)}
                          style={{ color: '#ef4444', background: '#fef2f2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReturns.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#ef4444'
            }}>
              <Trash2 size={30} />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>Confirm Delete?</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '25px' }}>
              Are you sure you want to delete this purchase return? <br/>
              <strong style={{ color: '#ef4444' }}>This action cannot be undone.</strong>
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setConfirmModal({ show: false, id: null })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.target.style.background = '#f8fafc'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Yes, Delete
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PurchaseReturn;
