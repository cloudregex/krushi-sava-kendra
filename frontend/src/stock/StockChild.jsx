import React, { useState, useMemo, useEffect } from 'react';
import { Layers, Search } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

import api from '../adminauth/utils/api';

const getExpiryStatus = (expireDate) => {
  if (!expireDate) return { status: 'N/A', type: 'unknown' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expireDate);
  const diffTime = exp - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'Expired', type: 'danger' };
  if (diffDays <= 30) return { status: `Expiring in ${diffDays} days`, type: 'warning' };
  return { status: 'Safe', type: 'success' };
};

const StockChild = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchases/batches');
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = useMemo(() => {
    return batches.filter(item =>
      (item.Product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.batchNo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, batches]);

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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Stock Child (Batches)</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Detailed batch-wise stock tracking</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search batches..."
                className="form-control"
                style={{ paddingLeft: '15px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ width: '150px' }}></div> {/* Spacer */}
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Batch No</th>
                  <th>Purchase Ref</th>
                  <th>Quantity</th>
                  <th>Purchase Price</th>
                  <th>Expire Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Loading batch data...</td></tr>
                ) : filteredBatches.map(item => {
                  const expiry = getExpiryStatus(item.expiryDate);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.Product?.name}</td>
                      <td><span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{item.batchNo || 'N/A'}</span></td>
                      <td>{item.Purchase?.supplierInvoiceNumber || `Bill #${item.purchaseId}`}</td>
                      <td><span style={{ fontWeight: '700' }}>{item.purchaseQty} {item.unit}</span></td>
                      <td>₹{item.purchasePrice}</td>
                      <td>{item.expiryDate || 'N/A'}</td>
                      <td>
                        <span className={`badge badge-${expiry.type}`} style={{ fontSize: '11px' }}>
                          {expiry.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredBatches.length === 0 && (
                  <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No batches found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChild;
