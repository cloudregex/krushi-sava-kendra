import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Plus, Calendar, User, IndianRupee, CheckCircle, Clock, FileText, Printer, Eye, Edit, Trash2 } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import { useAuth } from '../adminauth/context/AuthContext';
import toast from 'react-hot-toast';

const SaleBill = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [confirmModal, setConfirmModal] = useState({ show: false, bill: null });

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getAll('sales');
      setBills(data || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (bill) => {
    setConfirmModal({ show: true, bill });
  };

  const confirmDelete = async () => {
    const bill = confirmModal.bill;
    setConfirmModal({ show: false, bill: null });
    try {
      await ApiService.delete('sales', bill.id);
      toast.success("Bill deleted successfully");
      fetchBills();
    } catch (error) {
      console.error("Error deleting bill:", error);
      toast.error("Failed to delete bill");
    }
  };

  const handlePrint = (id) => {
    // Open in a new tab for standalone printing with quiet mode (hides UI buttons)
    window.open(`/print/sale/${id}?print=true&quiet=true`, '_blank');
  };

  const getStatus = (bill) => {
    if (bill.balanceAmount <= 0) return 'Paid';
    if (bill.paidAmount > 0) return 'Partial';
    return 'Unpaid';
  };

  const filteredBills = bills.filter(b => {
    const status = getStatus(b);
    const matchesSearch =
      b.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.customerId).includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Paid</span>;
      case 'Partial': return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Partial</span>;
      case 'Unpaid': return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Unpaid</span>;
      default: return <span className="badge">{status}</span>;
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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Sale Bills</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>View and manage all customer sale bills</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search bills..."
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
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {hasPermission('sale', 'create') && (
            <button className="btn-agro btn-primary" onClick={() => navigate('/sales/entry')} style={{ height: '38px', padding: '0 16px' }}>
              <Plus size={18} /> New Sale Bill
            </button>
          )}
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Loading bills...</td></tr>
                ) : filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>{bill.invoiceNo}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{bill.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        📞 {bill.customer?.mobile || 'No Mobile'}
                      </div>
                    </td>
                    <td>{bill.billDate}</td>
                    <td style={{ fontWeight: '700' }}>₹{(bill.grandTotal || 0).toFixed(2)}</td>
                    <td style={{ color: '#16a34a', fontWeight: '600' }}>₹{(bill.paidAmount || 0).toFixed(2)}</td>
                    <td style={{ color: (parseFloat(bill.balanceAmount) || 0) > 0 ? '#ef4444' : 'inherit', fontWeight: '600' }}>₹{(parseFloat(bill.balanceAmount) || 0).toFixed(2)}</td>
                    <td>
                      {(() => {
                        const pm = bill.paymentMode;
                        if (!pm) return <span style={{ color: '#94a3b8', fontSize: '11px' }}>N/A</span>;
                        if (typeof pm === 'string') {
                          return <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#475569' }}>{pm}</span>;
                        }
                        try {
                          const parsed = typeof pm === 'string' ? JSON.parse(pm) : pm;
                          if ((parsed.cash || 0) === 0 && (parsed.upi || 0) === 0 && (parsed.swipe || 0) === 0) {
                            return <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>Unpaid</span>;
                          }
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {parsed.cash > 0 && <span style={{ fontSize: '10px', color: '#15803d', fontWeight: '700', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>💵 Cash: ₹{parsed.cash.toFixed(2)}</span>}
                              {parsed.upi > 0 && <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: '700', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>📱 UPI: ₹{parsed.upi.toFixed(2)}</span>}
                              {parsed.swipe > 0 && <span style={{ fontSize: '10px', color: '#7e22ce', fontWeight: '700', background: '#faf5ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e9d5ff' }}>💳 Swipe: ₹{parsed.swipe.toFixed(2)}</span>}
                            </div>
                          );
                        } catch (e) {
                          return <span>{String(pm)}</span>;
                        }
                      })()}
                    </td>
                    <td>{getStatusBadge(getStatus(bill))}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {hasPermission('sale', 'view') && (
                          <>
                            <button
                              className="action-icon-btn view"
                              title="View"
                              onClick={() => navigate(`/sales/bills/view/${bill.id}`)}
                              style={{ color: '#3b82f6', background: '#eff6ff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              className="action-icon-btn print"
                              title="Print"
                              onClick={() => handlePrint(bill.id)}
                              style={{ color: '#16a34a', background: '#ecfdf5', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Printer size={18} />
                            </button>
                          </>
                        )}
                        {hasPermission('sale', 'update') && (
                          <button
                            className="action-icon-btn edit"
                            title="Edit"
                            onClick={() => navigate(`/sales/bills/edit/${bill.id}`)}
                            style={{ color: '#eab308', background: '#fffbeb', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            <Edit size={18} />
                          </button>
                        )}
                        {hasPermission('sale', 'delete') && (
                          <button
                            className="action-icon-btn delete"
                            title="Delete"
                            onClick={() => handleDeleteClick(bill)}
                            style={{ color: '#ef4444', background: '#fef2f2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredBills.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
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
              Are you sure you want to delete bill <strong>{confirmModal.bill?.invoiceNo}</strong>? <br />
              <strong style={{ color: '#ef4444' }}>This action will reverse the stock reduction.</strong>
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setConfirmModal({ show: false, bill: null })}
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

export default SaleBill;
