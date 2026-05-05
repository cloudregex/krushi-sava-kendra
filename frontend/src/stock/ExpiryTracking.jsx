import React, { useMemo } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

const mockStockBatches = [
  { id: 'B001', productName: 'Urea 45%', batchNo: 'UR-2023-1', quantityAvailable: 500, expireDate: '2026-10-15' },
  { id: 'B002', productName: 'Urea 45%', batchNo: 'UR-2023-2', quantityAvailable: 350, expireDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
  { id: 'B003', productName: 'DAP Fertilizer', batchNo: 'DAP-A1', quantityAvailable: 200, expireDate: '2027-01-01' },
  { id: 'B004', productName: 'Pesticide X', batchNo: 'PX-99', quantityAvailable: 10, expireDate: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
];

const getExpiryStatus = (expireDate) => {
  if (!expireDate) return { status: 'Unknown', type: 'unknown' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expireDate);
  const diffTime = exp - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'Expired', type: 'danger', days: diffDays };
  if (diffDays <= 30) return { status: `Expiring in ${diffDays} days`, type: 'warning', days: diffDays };
  return { status: 'Safe', type: 'success', days: diffDays };
};

const ExpiryTracking = () => {
  const expiryAlerts = useMemo(() => {
    return mockStockBatches.map(batch => ({ ...batch, expiryInfo: getExpiryStatus(batch.expireDate) }))
      .filter(batch => batch.expiryInfo.type === 'danger' || batch.expiryInfo.type === 'warning')
      .sort((a, b) => a.expiryInfo.days - b.expiryInfo.days);
  }, []);

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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Expiry Tracking</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Monitor products nearing expiration and blocked items</p>
          </div>
          <div style={{ width: '150px' }}></div>
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Alert Type</th>
                  <th>Product Name</th>
                  <th>Batch No</th>
                  <th>Qty Remaining</th>
                  <th>Expire Date</th>
                  <th>Action Required</th>
                </tr>
              </thead>
              <tbody>
                {expiryAlerts.map(item => (
                  <tr key={item.id} style={{ background: item.expiryInfo.type === 'danger' ? '#fef2f2' : '#fffbeb' }}>
                    <td>
                      <span className={`badge badge-${item.expiryInfo.type}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', width: 'max-content', fontSize: '11px' }}>
                        <AlertTriangle size={14} />
                        {item.expiryInfo.type === 'danger' ? 'Expired' : 'Expiring Soon'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{item.productName}</td>
                    <td>{item.batchNo}</td>
                    <td style={{ fontWeight: '700' }}>{item.quantityAvailable}</td>
                    <td>{item.expireDate}</td>
                    <td>
                      {item.expiryInfo.type === 'danger' ? (
                        <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                          <XCircle size={16} /> Blocked for Sale
                        </span>
                      ) : (
                        <span style={{ color: '#d97706', fontWeight: '600', fontSize: '13px' }}>
                          Clear stock in {item.expiryInfo.days} days
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {expiryAlerts.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No expiry alerts at the moment. All stock is safe.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpiryTracking;
