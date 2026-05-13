import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Plus, Calendar, User, IndianRupee, CheckCircle, Clock, FileText, Printer, Eye, Edit, Trash2 } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import { useAuth } from '../adminauth/context/AuthContext';

const SaleBill = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (bill) => {
    setBillToDelete(bill);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await ApiService.delete('sales', billToDelete.id);
      setDeleteModalOpen(false);
      setBillToDelete(null);
      fetchBills();
    } catch (error) {
      console.error("Delete Error:", error);
    }
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
                  <th style={{ textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Loading bills...</td></tr>
                ) : filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: '800', fontSize: '13px', color: '#1e293b' }}>{bill.invoiceNo}</td>
                    <td>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>{bill.customer?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
                        📞 {bill.customer?.mobile || 'No Mobile'}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>{bill.billDate}</td>
                    <td style={{ fontWeight: '800', fontSize: '14px', color: '#1e293b' }}>₹{(bill.grandTotal || 0).toFixed(2)}</td>
                    <td style={{ color: '#16a34a', fontWeight: '800', fontSize: '13px' }}>₹{(bill.paidAmount || 0).toFixed(2)}</td>
                    <td>
                      {bill.balanceAmount > 0 ? (
                        <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '14px', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>
                          ₹{(bill.balanceAmount || 0).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontWeight: '500', fontSize: '13px' }}>₹0.00</span>
                      )}
                    </td>
                    <td>
                      {(() => {
                        const pm = bill.paymentMode;
                        if (!pm) return <span style={{ color: '#94a3b8', fontSize: '11px' }}>N/A</span>;

                        // Legacy string format
                        if (typeof pm === 'string') {
                          return <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', color: '#475569' }}>{pm}</span>;
                        }

                        // JSON Object format
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
                    <td style={{ textAlign: 'left' }}>
                      {hasPermission('sale', 'view') && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <button
                            onClick={() => navigate(`/sales/bills/view/${bill.id}`)}
                            style={{ background: 'none', border: 'none', color: '#3b82f6', padding: 0, cursor: 'pointer', display: 'flex' }}
                            title="View Bill"
                          >
                            <Eye size={18} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => navigate(`/sales/bills/view/${bill.id}?print=true`)}
                            style={{ background: 'none', border: 'none', color: '#16a34a', padding: 0, cursor: 'pointer', display: 'flex' }}
                            title="Print Bill"
                          >
                            <Printer size={18} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => navigate(`/sales/bills/edit/${bill.id}`)}
                            style={{ background: 'none', border: 'none', color: '#eab308', padding: 0, cursor: 'pointer', display: 'flex' }}
                            title="Edit Bill"
                          >
                            <Edit size={18} strokeWidth={2} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(bill)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', padding: 0, cursor: 'pointer', display: 'flex' }}
                            title="Delete Bill"
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </button>
                        </div>
                      )}
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', color: '#ef4444' }}>
              <Trash2 size={30} />
              <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Delete Sale Bill?</h3>
            </div>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
              Are you sure you want to delete bill <strong>{billToDelete?.invoiceNo}</strong>? This action cannot be undone and will revert the stock inventory.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-agro btn-outline"
                onClick={() => { setDeleteModalOpen(false); setBillToDelete(null); }}
              >
                Cancel
              </button>
              <button
                className="btn-agro btn-primary"
                style={{ background: '#ef4444', borderColor: '#ef4444' }}
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleBill;
