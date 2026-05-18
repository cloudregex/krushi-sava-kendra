import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee } from 'lucide-react';
import api from '../adminauth/utils/api';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const PurchasePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('Payment towards pending bill');

  useEffect(() => {
    fetchBillDetails();
  }, [id]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/purchases/${id}`);
      setBill(res.data);
      if (res.data && res.data.dueAmount) {
        setAmount(res.data.dueAmount);
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
      toast.error("Failed to load bill details");
      navigate('/purchase/pending');
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async () => {
    if (!amount || amount <= 0) return toast.error("Please enter a valid amount");
    if (amount > bill.dueAmount) return toast.error(`Amount cannot exceed due amount (₹${bill.dueAmount})`);

    try {
      toast.loading("Processing payment...", { id: 'payment' });
      await api.post(`/purchases/${bill.id}/pay`, {
        amount,
        paymentMode: mode,
        paymentDate: date,
        remarks
      });
      toast.success("Payment successful", { id: 'payment' });
      navigate('/purchase/pending');
    } catch (error) {
      console.error(error);
      toast.error("Payment failed", { id: 'payment' });
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
        <div className="agro-header-compact" style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 25px', borderBottom: '1px solid var(--border-light)' }}>
          <button className="btn-agro btn-outline" style={{ padding: '6px 10px', height: '32px' }} onClick={() => navigate('/purchase/pending')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0, fontWeight: '800', color: '#1e293b' }}>Make Payment</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Settle dues for Bill #{bill.id}</p>
          </div>
        </div>

        <div style={{ padding: '25px' }}>
          <div style={{ marginBottom: '20px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Supplier</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{bill.Supplier?.name || 'N/A'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Bill Due Amount</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '900', color: '#ef4444' }}>₹{parseFloat(bill.dueAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Amount to Pay (₹)</label>
            <input 
              type="number" 
              className="form-control" 
              style={{ fontSize: '16px', fontWeight: '700', padding: '12px 15px' }}
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              max={bill.dueAmount}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Payment Mode</label>
            <select 
              className="form-control" 
              style={{ padding: '10px 15px' }}
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Swipe">Swipe</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Payment Date</label>
            <input 
              type="date" 
              className="form-control" 
              style={{ padding: '10px 15px' }}
              value={date} 
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Remarks</label>
            <input 
              type="text" 
              className="form-control" 
              style={{ padding: '10px 15px' }}
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional remark..."
            />
          </div>
          
          <button className="btn-agro btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: '700', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={submitPayment}>
            <IndianRupee size={20} /> Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchasePayment;
