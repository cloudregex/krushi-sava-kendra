import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';
import api from '../adminauth/utils/api';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const PurchasePaymentHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillHistory();
  }, [id]);

  const fetchBillHistory = async () => {
    try {
      setLoading(true);
      // getById now includes payments via purchaseController.js?
      // Wait, getById in purchaseController only includes items.
      // Let's use getPendingBills or fetch the specific bill with payments.
      // Wait, we need an API to get the history.
      const res = await api.get(`/purchases/pending`); // Or we can fetch all pending and find it, but it might not be pending if fully paid.
      // To properly get history, we need the payments.
      // Let's fetch all and filter, or update backend?
      // Actually, if we hit /api/purchases/:id, we need payments included.
      // I'll update the backend to include SupplierPayment in getById.
      const billRes = await api.get(`/purchases/${id}`);
      setBill(billRes.data);
    } catch (error) {
      console.error("Error fetching bill history:", error);
      toast.error("Failed to load bill history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="agro-container"><div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div></div>;
  }

  if (!bill) {
    return <div className="agro-container"><div style={{ padding: '20px', textAlign: 'center' }}>Bill not found</div></div>;
  }

  return (
    <div className="agro-container">
      <div className="agro-unified-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ background: 'var(--primary-soft)', padding: '20px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn-agro btn-outline" style={{ padding: '6px 10px', height: '32px', background: 'white' }} onClick={() => navigate('/purchase/pending')}>
            <ArrowLeft size={16} />
          </button>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={22} /> Payment History
          </h3>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Supplier</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{bill.Supplier?.name || 'N/A'}</p>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-light)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Bill ID / Invoice</p>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>#{bill.id} <span style={{ color: '#9ca3af', fontWeight: '500' }}>({bill.supplierInvoiceNumber || 'N/A'})</span></p>
            </div>
          </div>
          
          <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
            <table className="agro-table" style={{ margin: 0 }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '15px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>DATE</th>
                  <th style={{ padding: '15px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>PAYMENT DETAILS</th>
                  <th style={{ padding: '15px', fontSize: '13px', fontWeight: '700', color: '#475569', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {bill.payments && bill.payments.length > 0 ? (
                  bill.payments.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '15px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                        {new Date(p.paymentDate).toLocaleDateString('en-GB')}
                      </td>
                      <td style={{ padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: '700', padding: '4px 10px' }}>{p.paymentMode}</span>
                        </div>
                        {p.remarks && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>📝 {p.remarks}</div>}
                      </td>
                      <td style={{ padding: '15px', fontSize: '16px', fontWeight: '800', color: '#16a34a', textAlign: 'right' }}>
                        ₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                      <History size={40} style={{ opacity: 0.3, marginBottom: '15px' }} />
                      <br />
                      <span style={{ fontSize: '15px', fontWeight: '500' }}>No payments recorded yet.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePaymentHistory;
