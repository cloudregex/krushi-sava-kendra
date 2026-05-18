import React, { useState, useEffect } from 'react';
import { Search, History, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../adminauth/utils/api';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const PurchasePending = () => {
  const navigate = useNavigate();
  const [pendingBills, setPendingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPendingBills();
  }, []);

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchases/pending');
      setPendingBills(res.data || []);
    } catch (error) {
      console.error("Error fetching pending bills:", error);
      toast.error("Failed to load pending bills");
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (bill) => {
    navigate(`/purchase/pending/pay/${bill.id}`);
  };

  const viewHistory = (bill) => {
    navigate(`/purchase/pending/history/${bill.id}`);
  };

  const filteredBills = pendingBills.filter(b => {
    const sName = b.Supplier?.name || 'N/A';
    return (
      String(b.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      sName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(b.supplierInvoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="agro-container">
      <div className="agro-unified-card">
        <div className="agro-header-compact" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 25px', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '800', color: '#1e293b' }}>Purchase Udhari (Pending)</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Manage supplier dues and payment history</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0 12px', width: '280px', height: '36px' }}>
              <Search size={16} color="#9ca3af" />
              <input 
                type="text" 
                placeholder="Search supplier or bill..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', paddingLeft: '8px', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="agro-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Supplier</th>
                <th>Bill Date</th>
                <th>Total (₹)</th>
                <th>Paid (₹)</th>
                <th>Due (₹)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading...</td></tr>
              ) : filteredBills.length > 0 ? (
                filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{bill.id}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{bill.Supplier?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Inv: {bill.supplierInvoiceNumber || 'N/A'}</div>
                    </td>
                    <td>{bill.billDate}</td>
                    <td style={{ fontWeight: '700' }}>{parseFloat(bill.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ color: '#16a34a', fontWeight: '600' }}>{parseFloat(bill.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ color: '#ef4444', fontWeight: '800' }}>{parseFloat(bill.dueAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          className="btn-agro btn-primary" 
                          style={{ padding: '6px 12px', fontSize: '12px', height: '30px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                          onClick={() => handlePayClick(bill)}
                        >
                          <IndianRupee size={14} /> Pay
                        </button>
                        <button 
                          className="btn-agro btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '12px', height: '30px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                          onClick={() => viewHistory(bill)}
                        >
                          <History size={14} /> History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <CheckCircle size={40} color="#10b981" style={{ marginBottom: '10px', opacity: 0.5 }} />
                    <br/>
                    No pending dues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchasePending;
