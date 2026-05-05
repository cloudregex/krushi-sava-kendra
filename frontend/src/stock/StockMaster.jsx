import React, { useState, useMemo } from 'react';
import { Package, Search, CheckCircle, XCircle } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

const mockStockMaster = [
  { id: 'SM001', productName: 'Urea 45%', totalQuantity: 1000, totalAvailable: 850 },
  { id: 'SM002', productName: 'DAP Fertilizer', totalQuantity: 500, totalAvailable: 200 },
  { id: 'SM003', productName: 'Pesticide X', totalQuantity: 200, totalAvailable: 0 },
];

const StockMaster = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMaster = useMemo(() => {
    return mockStockMaster.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
                  <th>Master ID</th>
                  <th>Product Name</th>
                  <th>Total Quantity</th>
                  <th>Total Available Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaster.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ fontWeight: '600' }}>{item.productName}</td>
                    <td>{item.totalQuantity}</td>
                    <td>
                      <span style={{ fontWeight: '700', color: item.totalAvailable > 0 ? '#16a34a' : '#ef4444' }}>
                        {item.totalAvailable}
                      </span>
                    </td>
                    <td>
                      {item.totalAvailable > 0 ? (
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
