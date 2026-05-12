import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Search, Plus, Calendar, FileText, IndianRupee, CheckCircle, Clock } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import '../mastermodel/styles/MasterModel.css';

const PurchaseBill = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const data = await ApiService.getAll('purchases');
      setBills(data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (bill) => {
    const paid = parseFloat(bill.paidAmount) || 0;
    const due = parseFloat(bill.dueAmount) || 0;
    if (due <= 0) return 'Paid';
    if (paid > 0) return 'Partial';
    return 'Unpaid';
  };

  const filteredBills = bills.filter(b => {
    const sName = b.Supplier?.name || 'N/A';
    const matchesSearch =
      String(b.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.supplierInvoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = getStatus(b);
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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Purchase Bills</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>View and manage all supplier purchase bills</p>
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

          <button className="btn-agro btn-primary" onClick={() => navigate('/purchase/entry')} style={{ height: '38px', padding: '0 16px' }}>
            <Plus size={18} /> New Purchase Bill
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Inv No</th>
                  <th>Supplier</th>
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
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>Loading bills...</td></tr>
                ) : filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>#PUR-{bill.id}</td>
                    <td style={{ fontSize: '12px' }}>{bill.supplierInvoiceNumber || '-'}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{bill.Supplier?.name || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {bill.supplierId}</div>
                    </td>
                    <td>{bill.billDate}</td>
                    <td style={{ fontWeight: '700' }}>₹{(parseFloat(bill.grandTotal) || 0).toFixed(2)}</td>
                    <td style={{ color: '#16a34a', fontWeight: '600' }}>₹{(parseFloat(bill.paidAmount) || 0).toFixed(2)}</td>
                    <td style={{ color: (parseFloat(bill.dueAmount) || 0) > 0 ? '#ef4444' : 'inherit', fontWeight: '600' }}>₹{(parseFloat(bill.dueAmount) || 0).toFixed(2)}</td>
                    <td>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' }}>{bill.paymentType || 'Mixed'}</span>
                    </td>
                    <td>{getStatusBadge(getStatus(bill))}</td>
                    <td style={{ textAlign: 'left' }}>
                      <button
                        className="btn-agro btn-outline"
                        onClick={() => navigate(`/purchase/bills/view/${bill.id}`)}
                        style={{ padding: '4px 12px', height: '28px', fontSize: '11px' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredBills.length === 0 && (
                  <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseBill;
