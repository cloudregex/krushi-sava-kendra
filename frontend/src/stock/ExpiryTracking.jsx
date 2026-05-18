import React, { useState, useMemo, useEffect } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

import api from '../adminauth/utils/api';

const getExpiryStatus = (expireDate) => {
  if (!expireDate) return { status: 'N/A', type: 'unknown', days: 999 };
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
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiryData();
  }, []);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchases/batches');
      setBatches(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching expiry data:", error);
    } finally {
      setLoading(false);
    }
  };

  const expiryAlerts = useMemo(() => {
    return batches.map(batch => ({ ...batch, expiryInfo: getExpiryStatus(batch.expiryDate) }))
      .filter(batch => batch.expiryInfo.type === 'danger' || batch.expiryInfo.type === 'warning')
      .sort((a, b) => a.expiryInfo.days - b.expiryInfo.days);
  }, [batches]);

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
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Checking for expiry alerts...</td></tr>
                ) : expiryAlerts.map(item => (
                  <tr key={item.id} style={{ background: item.expiryInfo.type === 'danger' ? '#fef2f2' : '#fffbeb' }}>
                    <td>
                      <span className={`badge badge-${item.expiryInfo.type}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', width: 'max-content', fontSize: '11px' }}>
                        <AlertTriangle size={14} />
                        {item.expiryInfo.type === 'danger' ? 'Expired' : 'Expiring Soon'}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{item.Product?.name}</td>
                    <td>{item.batchNo || 'N/A'}</td>
                    <td style={{ fontWeight: '700' }}>{item.purchaseQty} {item.unit}</td>
                    <td>{item.expiryDate || 'N/A'}</td>
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
