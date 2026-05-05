import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Calendar, User, AlertCircle, Printer } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

const ViewPurchaseReturn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnData, setReturnData] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchReturnData = async () => {
      const mockMaster = {
        id: id,
        purchaseId: 'PUR-501',
        supplierId: 'SUP-101',
        supplierName: 'Agro Traders Pvt Ltd',
        mobile: '9988776655',
        returnDate: '2026-04-28',
        totalAmount: 1200.50,
        reason: 'Damaged Products Received',
        status: 'Processed'
      };

      const mockItems = [
        { id: 1, productName: 'Urea Fertilizer 50kg', batchNo: 'B-2309', quantity: 1, rate: 450.00, taxAmount: 22.50, amount: 472.50 },
        { id: 2, productName: 'Glyphosate Weedicide 1L', batchNo: 'G-1102', quantity: 2, rate: 350.00, taxAmount: 28.00, amount: 728.00 }
      ];

      setReturnData(mockMaster);
      setItems(mockItems);
    };

    fetchReturnData();
  }, [id]);

  if (!returnData) {
    return <div className="agro-container flex-center" style={{ height: '50vh' }}>Loading return details...</div>;
  }

  return (
    <div className="agro-container print-area" style={{ padding: '0 25px' }}>
      <style>
        {`
          @media screen {
            .print-only-header { display: none !important; }
          }
          @media print {
            .no-print { display: none !important; }
            .agro-container { padding: 0 !important; }
            .agro-unified-card { box-shadow: none !important; border: none !important; margin: 0 !important; }
            .agro-header-compact { display: none !important; }
            .print-only-header { display: block !important; margin-bottom: 25px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .print-only-header h1 { margin: 0; font-size: 26px; color: #000; font-weight: 900; }
            .print-only-header p { margin: 2px 0; font-size: 14px; color: #333; font-weight: 500; }
            .return-info-section { grid-template-columns: 1fr 1fr !important; }
          }
        `}
      </style>

      <div className="print-only-header">
        <h1>KRUSHI SEVA KENDRA</h1>
        <p>Market Yard, Pune - 411037 | Contact: +91 99887 76655</p>
        <p style={{ marginTop: '5px', fontWeight: 'bold', textDecoration: 'underline' }}>PURCHASE RETURN DOCUMENTATION</p>
      </div>

      <div className="agro-unified-card" style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-light)',
        marginTop: '5px',
        overflow: 'hidden'
      }}>
        <div className="agro-header-compact no-print" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px', color: '#ef4444' }}>Purchase Return: {returnData.id}</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Supplier refund and inventory correction</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-agro btn-outline" onClick={() => window.print()} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <Printer size={16} /> Print
            </button>
            <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/returns')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="return-info-section" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px' }}>
              <div style={{ padding: '12px', background: '#fff1f2', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#ef4444' }}>
                  <User size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Supplier & Original Bill</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#be123c', textTransform: 'uppercase', fontWeight: '700' }}>Supplier</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{returnData.supplierName}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Contact: {returnData.mobile}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#be123c', textTransform: 'uppercase', fontWeight: '700' }}>Purchase ID</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{returnData.purchaseId}</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                  <Calendar size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Return Metadata</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Return Date</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{returnData.returnDate}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Status</p>
                    <span className="badge badge-success" style={{ padding: '3px 8px', fontSize: '10px' }}>{returnData.status}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="#d97706" />
              <div>
                <p style={{ margin: 0, fontSize: '10px', color: '#92400e', textTransform: 'uppercase', fontWeight: '700' }}>Reason for Return</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{returnData.reason}</p>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <table className="agro-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 15px' }}>Returned Product</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Tax (₹)</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: '10px 15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: '#fff1f2', color: '#ef4444', width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <RotateCcw size={14} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>{item.productName}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Batch: {item.batchNo}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: '#ef4444' }}>-{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>{item.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: '#ef4444' }}>{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: '320px', padding: '18px', background: '#fff1f2', borderRadius: '16px', border: '1px solid #fecdd3', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#be123c', fontWeight: '700' }}>TOTAL DEBIT AMOUNT</p>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#ef4444' }}>₹{returnData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#be123c', fontStyle: 'italic' }}>
                  Debit note issued for supplier refund
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseReturn;
