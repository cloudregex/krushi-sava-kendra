import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Plus, Calendar, User, IndianRupee, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from '../adminauth/context/AuthContext';

const initialBills = [
  { id: 'SALE-101', customerId: 'CUS-501', customerName: 'Ramesh Patil', billDate: '2026-04-20', grandTotal: 5400.00, paidAmount: 5400.00, dueAmount: 0, paymentType: 'Cash', status: 'Paid' },
  { id: 'SALE-102', customerId: 'CUS-502', customerName: 'Suresh Deshmukh', billDate: '2026-04-22', grandTotal: 12450.50, paidAmount: 8000, dueAmount: 4450.50, paymentType: 'UPI', status: 'Partial' },
  { id: 'SALE-103', customerId: 'CUS-503', customerName: 'Anil Jadhav', billDate: '2026-04-25', grandTotal: 8900.00, paidAmount: 0, dueAmount: 8900.00, paymentType: 'Credit', status: 'Unpaid' },
];

const SaleBill = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredBills = initialBills.filter(b => {
    const matchesSearch =
      String(b.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
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
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>{bill.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{bill.customerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bill.customerId}</div>
                    </td>
                    <td>{bill.billDate}</td>
                    <td style={{ fontWeight: '700' }}>₹{bill.grandTotal.toFixed(2)}</td>
                    <td style={{ color: '#16a34a', fontWeight: '600' }}>₹{bill.paidAmount.toFixed(2)}</td>
                    <td style={{ color: bill.dueAmount > 0 ? '#ef4444' : 'inherit', fontWeight: '600' }}>₹{bill.dueAmount.toFixed(2)}</td>
                    <td>
                      <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', fontSize: '11px' }}>{bill.paymentType}</span>
                    </td>
                    <td>{getStatusBadge(bill.status)}</td>
                    <td style={{ textAlign: 'left' }}>
                      {hasPermission('sale', 'view') && (
                        <button
                          className="btn-agro btn-outline"
                          onClick={() => navigate(`/sales/bills/view/${bill.id}`)}
                          style={{ padding: '4px 12px', height: '28px', fontSize: '11px' }}
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredBills.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleBill;
