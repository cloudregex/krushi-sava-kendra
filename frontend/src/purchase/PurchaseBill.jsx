import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Search, Plus, Calendar, FileText, IndianRupee, CheckCircle, Clock } from 'lucide-react';

const initialBills = [
  { id: 'PUR-001', supplierId: 'SUP-101', supplierName: 'Agro Traders Pvt Ltd', billDate: '2026-04-18', grandTotal: 18500.00, paidAmount: 18500.00, dueAmount: 0, paymentType: 'Swipe', status: 'Paid' },
  { id: 'PUR-002', supplierId: 'SUP-102', supplierName: 'Green Farms Supply', billDate: '2026-04-22', grandTotal: 42000.50, paidAmount: 20000, dueAmount: 22000.50, paymentType: 'Credit', status: 'Partial' },
  { id: 'PUR-003', supplierId: 'SUP-103', supplierName: 'Kisan Agro Mart', billDate: '2026-04-28', grandTotal: 9800.00, paidAmount: 0, dueAmount: 9800.00, paymentType: 'Credit', status: 'Unpaid' },
];

import '../mastermodel/styles/MasterModel.css';

const PurchaseBill = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredBills = initialBills.filter(b => {
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.supplierId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Paid</span>;
      case 'Partial': return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Partial</span>;
      case 'Paid': return <span className="badge badge-success"><CheckCircle size={12} /> Paid</span>;
      case 'Partial': return <span className="badge badge-warning"><Clock size={12} /> Partial</span>;
      case 'Unpaid': return <span className="badge badge-danger"><Clock size={12} /> Unpaid</span>;
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
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>{bill.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{bill.supplierName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{bill.supplierId}</div>
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

export default PurchaseBill;
