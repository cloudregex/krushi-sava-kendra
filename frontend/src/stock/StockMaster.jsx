import React, { useState, useMemo, useEffect } from 'react';
import { Package, Search, CheckCircle, XCircle } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

import api from '../adminauth/utils/api';

const StockMaster = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching stock:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaster = useMemo(() => {
    return products.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.marathiName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.hsnCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Stock Master</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Overall product stock levels across all batches</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <input
                type="text"
                placeholder="Search products..."
                className="form-control"
                style={{ paddingLeft: '15px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ width: '150px' }}></div> {/* Spacer to balance header */}
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>HSN Code</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading stock data...</td></tr>
                ) : filteredMaster.map(item => (
                  <tr key={item.id}>
                    <td>{item.hsnCode}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{item.marathiName}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>
                      <span style={{ fontWeight: '700', color: item.currentStock > 0 ? '#16a34a' : '#ef4444' }}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td>
                      {item.currentStock > 0 ? (
                        <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: '4px' }} /> In Stock</span>
                      ) : (
                        <span className="badge badge-danger"><XCircle size={12} style={{ marginRight: '4px' }} /> Out of Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredMaster.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockMaster;
