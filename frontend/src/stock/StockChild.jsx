import React, { useState, useMemo } from 'react';
import { Layers, Search } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

const mockStockBatches = [
  { id: 'B001', productName: 'Urea 45%', batchNo: 'UR-2023-1', purchaseId: 'PO-101', quantityAvailable: 500, mrp: 300, costPrice: 250, expireDate: '2026-10-15' },
  { id: 'B002', productName: 'Urea 45%', batchNo: 'UR-2023-2', purchaseId: 'PO-105', quantityAvailable: 350, mrp: 320, costPrice: 260, expireDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 'B003', productName: 'DAP Fertilizer', batchNo: 'DAP-A1', purchaseId: 'PO-102', quantityAvailable: 200, mrp: 1200, costPrice: 1000, expireDate: '2027-01-01' },
  { id: 'B004', productName: 'Pesticide X', batchNo: 'PX-99', purchaseId: 'PO-099', quantityAvailable: 10, mrp: 500, costPrice: 400, expireDate: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

const getExpiryStatus = (expireDate) => {
  if (!expireDate) return { status: 'Unknown', type: 'unknown' };
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

  const filteredBatches = useMemo(() => {
    return mockStockBatches.filter(item =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <th>Purchase ID</th>
                  <th>Qty Available</th>
                  <th>Cost Price (₹)</th>
                  <th>MRP (₹)</th>
                  <th>Expire Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map(item => {
                  const expiry = getExpiryStatus(item.expireDate);
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.productName}</td>
                      <td><span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{item.batchNo}</span></td>
                      <td>{item.purchaseId}</td>
                      <td><span style={{ fontWeight: '700' }}>{item.quantityAvailable}</span></td>
                      <td>{item.costPrice}</td>
                      <td>{item.mrp}</td>
                      <td>{item.expireDate}</td>
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
