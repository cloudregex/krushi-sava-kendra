import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Search, AlertCircle, Calendar, User, FileText, IndianRupee, Eye, Printer, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import '../mastermodel/styles/MasterModel.css';

const PurchaseReturn = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [returns, setReturns] = useState([
    { id: 'RET-001', purchaseId: 'PUR-501', supplierId: 'SUP-101', returnDate: '2026-04-28', totalAmount: 1200.50, reason: 'Damaged Products' },
    { id: 'RET-002', purchaseId: 'PUR-505', supplierId: 'SUP-105', returnDate: '2026-04-29', totalAmount: 850.00, reason: 'Expired Stock' },
  ]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this purchase return?")) {
      setReturns(returns.filter(r => r.id !== id));
      toast.success("Purchase return deleted successfully");
    }
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
                  <th>Purchase ID</th>
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
                    <td style={{ fontWeight: '700', fontSize: '13px', color: '#ef4444' }}>{item.id}</td>
                    <td>{item.purchaseId}</td>
                    <td>{item.supplierId}</td>
                    <td>{item.returnDate}</td>
                    <td style={{ fontWeight: '700' }}>₹{item.totalAmount.toFixed(2)}</td>
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
                          onClick={() => navigate(`/purchase/returns/view/${item.id}?print=true`)}
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
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReturn;
