import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, User, Package, Printer, CheckCircle, Clock } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

const ViewSaleBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [billData, setBillData] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchBillData = async () => {
      const mockMaster = {
        id: id,
        customerId: 'CUS-501',
        customerName: 'Ramesh Patil',
        mobile: '9822334455',
        billDate: '2026-04-20',
        paymentType: 'Cash',
        status: 'Paid',
        totalAmount: 5000.00,
        taxAmount: 400.00,
        grandTotal: 5400.00,
        paidAmount: 5400.00,
        dueAmount: 0
      };

      const mockItems = [
        { id: 1, productName: 'Urea Fertilizer 50kg', batchNo: 'B-120', quantity: 10, salePrice: 400.00, taxPercent: 5, taxAmount: 200.00, amount: 4200.00 },
        { id: 2, productName: 'Pesticide XYZ', batchNo: 'P-09', quantity: 2, salePrice: 500.00, taxPercent: 20, taxAmount: 200.00, amount: 1200.00 }
      ];

      setBillData(mockMaster);
      setItems(mockItems);
    };

    fetchBillData();
  }, [id]);

  if (!billData) {
    return <div className="agro-container flex-center" style={{ height: '50vh' }}>Loading bill details...</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '11px' }}><CheckCircle size={11} /> {status}</span>;
      case 'Partial': return <span className="badge badge-warning" style={{ padding: '4px 10px', fontSize: '11px' }}><Clock size={11} /> {status}</span>;
      case 'Unpaid': return <span className="badge badge-danger" style={{ padding: '4px 10px', fontSize: '11px' }}><Clock size={11} /> {status}</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

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
            .bill-info-section { grid-template-columns: 1fr 1fr !important; }
          }
        `}
      </style>

      <div className="print-only-header">
        <h1>KRUSHI SEVA KENDRA</h1>
        <p>Market Yard, Pune - 411037 | Contact: +91 99887 76655</p>
        <p style={{ marginTop: '5px', fontWeight: 'bold', textDecoration: 'underline' }}>SALE BILL / TAX INVOICE</p>
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Sale Bill: {billData.id}</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Reviewing customer tax invoice record</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-agro btn-outline" onClick={() => window.print()} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <Printer size={16} /> Print
            </button>
            <button className="btn-agro btn-outline" onClick={() => navigate('/sales/bills')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="bill-info-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                  <User size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Customer Details</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{billData.customerName}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>ID: {billData.customerId} | Contact: {billData.mobile}</p>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                  <FileText size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Bill Summary</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Bill Date</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{billData.billDate}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Payment</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700' }}>{billData.paymentType}</span>
                      {getStatusBadge(billData.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <table className="agro-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 15px' }}>Product & Batch</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
                    <th style={{ width: '100px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ width: '80px', textAlign: 'right' }}>Tax %</th>
                    <th style={{ width: '120px', textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: '10px 15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ background: 'var(--primary-soft)', color: 'var(--primary)', width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={14} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: '700', fontSize: '13px' }}>{item.productName}</p>
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Batch: {item.batchNo}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{item.salePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>{item.taxPercent}%</td>
                      <td style={{ textAlign: 'right', fontWeight: '800' }}>{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px' }}>
              <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', textAlign: 'center', lineHeight: '1.6' }}>
                  Thank you for your business! <br />
                  Goods once sold will only be returned per company policy.
                </p>
              </div>

              <div style={{ minWidth: '320px', padding: '18px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Sub Total:</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>₹{billData.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Tax Amount:</span>
                  <span style={{ fontWeight: '700', color: '#1e293b' }}>₹{billData.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', color: 'var(--primary)' }}>
                  <span style={{ fontWeight: '900' }}>Grand Total:</span>
                  <span style={{ fontWeight: '900' }}>₹{billData.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div style={{ height: '1px', background: 'var(--border-light)', margin: '4px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a' }}>
                  <span style={{ fontWeight: '700' }}>Paid Amount:</span>
                  <span style={{ fontWeight: '800' }}>₹{billData.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {billData.dueAmount > 0 && (
                  <div style={{
                    marginTop: '5px',
                    padding: '8px 12px',
                    background: '#fff1f2',
                    borderRadius: '8px',
                    border: '1px solid #fecdd3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#e11d48'
                  }}>
                    <span style={{ fontWeight: '700' }}>Balance Due:</span>
                    <span style={{ fontWeight: '900' }}>₹{billData.dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSaleBill;
