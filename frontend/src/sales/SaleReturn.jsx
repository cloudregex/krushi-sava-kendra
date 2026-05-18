import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import '../mastermodel/styles/MasterModel.css';

const SaleReturn = () => {
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
      const data = await ApiService.getAll('sales/returns');
      setReturns(data || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = returns.filter(r =>
    (r.returnNo || r.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.saleInvoiceNo || r.saleId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.customerId).includes(searchTerm) ||
    (r.customer?.name || r.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.saleId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(r.customerId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.customerName && r.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Sales Returns</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Manage customer returns and refunds</p>
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

          <button className="btn-agro btn-primary" onClick={() => navigate('/sales/returns/new')} style={{ height: '38px', padding: '0 16px', background: '#ef4444' }}>
            <RotateCcw size={18} /> New Sale Return
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Sale ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th style={{ textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading returns...</td></tr>
                ) : filteredReturns.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: '#ef4444' }}>{item.returnNo || `SRTN-${new Date(item.returnDate || item.createdAt || new Date()).getFullYear()}-${String(item.id).padStart(6, '0')}`}</td>
                    <td>{item.saleInvoiceNo || item.saleId}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.customer?.name || item.customerName || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {item.customerId}</div>
                    </td>
                    <td>{item.returnDate}</td>
                    <td style={{ fontWeight: '700' }}>₹{(item.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <AlertCircle size={14} color="#f59e0b" />
                        {item.reason}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <button
                        className="btn-agro btn-outline"
                        onClick={() => navigate(`/sales/returns/view/${item.id}`)}
                        style={{ padding: '4px 12px', height: '28px', fontSize: '11px' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredReturns.length === 0 && (
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

export default SaleReturn;
