import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, Clock, AlertCircle, Search, Printer, Edit, Trash2 } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const Quotation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ show: false, quotation: null });

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAll('quotations');
      setQuotations(data || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (quotation) => {
    setConfirmModal({ show: true, quotation });
  };

  const confirmDelete = async () => {
    const qtn = confirmModal.quotation;
    setConfirmModal({ show: false, quotation: null });
    try {
      await ApiService.delete('quotations', qtn.id);
      toast.success("Quotation deleted successfully");
      fetchQuotations();
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast.error("Failed to delete quotation");
    }
  };

  const handlePrint = (id) => {
    window.open(`/print/quotation/${id}?print=true&quiet=true`, '_blank');
  };

  const filteredQuotations = quotations.filter(q => {
    const qNo = q.quotationNo || `QTN-${new Date(q.date || q.createdAt).getFullYear()}-${String(q.id).padStart(6, '0')}`;
    const matchesSearch = String(q.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      qNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customer?.name && q.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (q.customer?.mobile && q.customer.mobile.toLowerCase().includes(searchTerm.toLowerCase()));

    // DB मध्ये Expired असा status नसतो — validUntil उलटून गेली असेल तर Expired मानतो
    const isExpiredByDate = q.validUntil && new Date(q.validUntil) < new Date() && q.status === 'Pending';
    const effectiveStatus = isExpiredByDate ? 'Expired' : q.status;

    let matchesStatus = false;
    if (statusFilter === 'All') {
      matchesStatus = true;
    } else if (statusFilter === 'Expired') {
      matchesStatus = isExpiredByDate;
    } else if (statusFilter === 'Pending') {
      // Pending filter मध्ये फक्त न-Expired Pending दाखवतो
      matchesStatus = q.status === 'Pending' && !isExpiredByDate;
    } else {
      matchesStatus = q.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status, validUntil) => {
    const isExpired = validUntil && new Date(validUntil) < new Date() && status === 'Pending';
    const displayStatus = isExpired ? 'Expired' : status;

    switch (displayStatus) {
      case 'Accepted': return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> {displayStatus}</span>;
      case 'Pending': return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {displayStatus}</span>;
      case 'Expired': return <span className="badge" style={{ background: '#fee2e2', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {displayStatus}</span>;
      default: return <span className="badge">{displayStatus}</span>;
    }
  };

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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Sales Quotations</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Create and manage price quotes for customers</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search quotations..."
                className="form-control"
                style={{ paddingLeft: '15px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: '130px', height: '38px', fontSize: '13px', borderRadius: '10px', background: '#f8fafc', border: '1px solid var(--border)' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <button className="btn-agro btn-primary" onClick={() => navigate('/sales/quotations/new')} style={{ height: '38px', padding: '0 16px', background: '#8b5cf6' }}>
            <Plus size={18} /> New Quotation
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Qtn ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Expiry Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading quotations...</td></tr>
                ) : filteredQuotations.map((item) => {
                  const qNo = item.quotationNo || `QTN-${new Date(item.date || item.createdAt).getFullYear()}-${String(item.id).padStart(6, '0')}`;
                  const isExpired = item.validUntil && new Date(item.validUntil) < new Date() && item.status === 'Pending';
                  
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '700', fontSize: '13px', color: '#8b5cf6' }}>{qNo}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{item.customer?.name || 'Unknown'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          📞 {item.customer?.mobile || 'No Mobile'}
                        </div>
                      </td>
                      <td>{item.date || item.createdAt?.split('T')[0]}</td>
                      <td style={{ color: isExpired ? '#ef4444' : 'inherit', fontWeight: isExpired ? '700' : 'normal' }}>
                        {item.validUntil || 'N/A'}
                      </td>
                      <td style={{ fontWeight: '700' }}>₹{(item.grandTotal || item.totalAmount || 0).toFixed(2)}</td>
                      <td>{getStatusBadge(item.status, item.validUntil)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            className="btn-agro btn-outline"
                            onClick={() => {
                              if (item.status === 'Accepted') return;
                              navigate('/sales/entry', { state: { quotationData: item } });
                            }}
                            title={item.status === 'Accepted' ? 'Already Converted to Bill' : 'Convert to Bill'}
                            disabled={item.status === 'Accepted'}
                            style={{
                              padding: '4px 12px',
                              height: '28px',
                              fontSize: '11px',
                              borderColor: item.status === 'Accepted' ? '#d1d5db' : '#8b5cf6',
                              color: item.status === 'Accepted' ? '#9ca3af' : '#8b5cf6',
                              cursor: item.status === 'Accepted' ? 'not-allowed' : 'pointer',
                              opacity: item.status === 'Accepted' ? 0.6 : 1
                            }}
                          >
                            {item.status === 'Accepted' ? '✅ Converted' : 'Convert to Bill'}
                          </button>
                          
                          <button
                            className="action-icon-btn print"
                            title="Print Quotation"
                            onClick={() => handlePrint(item.id)}
                            style={{ color: '#16a34a', background: '#ecfdf5', border: 'none', padding: '5px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                          >
                            <Printer size={16} />
                          </button>

                          {/* Accepted quotation साठी Edit आणि Delete लपवतो */}
                          <button
                            className="action-icon-btn edit"
                            title={item.status === 'Accepted' ? 'Bill Convert झाले — Edit होणार नाही' : 'Edit Quotation'}
                            onClick={() => {
                              if (item.status === 'Accepted') return;
                              navigate(`/sales/quotations/edit/${item.id}`);
                            }}
                            style={{
                              color: item.status === 'Accepted' ? '#9ca3af' : '#eab308',
                              background: item.status === 'Accepted' ? '#f3f4f6' : '#fffbeb',
                              border: 'none',
                              padding: '5px',
                              borderRadius: '6px',
                              cursor: item.status === 'Accepted' ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className="action-icon-btn delete"
                            title={item.status === 'Accepted' ? 'Bill Convert झाले — Delete होणार नाही' : 'Delete Quotation'}
                            onClick={() => {
                              if (item.status === 'Accepted') return;
                              handleDeleteClick(item);
                            }}
                            style={{
                              color: item.status === 'Accepted' ? '#9ca3af' : '#ef4444',
                              background: item.status === 'Accepted' ? '#f3f4f6' : '#fef2f2',
                              border: 'none',
                              padding: '5px',
                              borderRadius: '6px',
                              cursor: item.status === 'Accepted' ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!loading && filteredQuotations.length === 0 && (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
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
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>Confirm Delete</h3>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
              Are you sure you want to delete quotation <strong>{confirmModal.quotation?.quotationNo || `QTN-${confirmModal.quotation?.id}`}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn-agro btn-outline"
                onClick={() => setConfirmModal({ show: false, quotation: null })}
                style={{ padding: '8px 16px', height: '38px', borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                className="btn-agro btn-danger"
                onClick={confirmDelete}
                style={{ padding: '8px 16px', height: '38px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotation;
