import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, User, Package, IndianRupee, Printer, CheckCircle, Clock } from 'lucide-react';
import { MockService } from '../mastermodel/services/MockService';

import '../mastermodel/styles/MasterModel.css';

const ViewPurchaseBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [billData, setBillData] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Mock fetching data based on ID
    const fetchBillData = async () => {
      // Mock Master Data
      const mockMaster = {
        id: id,
        supplierId: 'SUP-101',
        supplierName: 'Agro Traders Pvt Ltd',
        billDate: '2026-04-18',
        paymentType: 'Swipe',
        status: 'Paid',
        totalAmount: 18000.00,
        taxAmount: 500.00,
        grandTotal: 18500.00,
        paidAmount: 18500.00,
        dueAmount: 0
      };

      // Mock Items Data
      const mockItems = [
        { id: 1, productName: 'DAP Fertilizer 50kg', batchNo: 'B-890', quantity: 20, purchasePrice: 850.00, taxPercent: 5, taxAmount: 42.50, amount: 892.50 * 20 },
        { id: 2, productName: 'Urea Fertilizer 50kg', batchNo: 'B-120', quantity: 15, purchasePrice: 400.00, taxPercent: 5, taxAmount: 20.00, amount: 420.00 * 15 }
      ];

      setBillData(mockMaster);
      setItems(mockItems);
    };

    fetchBillData();
  }, [id]);

  if (!billData) {
    return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading bill details...</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> {status}</span>;
      case 'Partial': return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {status}</span>;
      case 'Unpaid': return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {status}</span>;
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
            .print-only-header { display: block !important; margin-bottom: 30px; text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .print-only-header h1 { margin: 0 0 5px 0; font-size: 24px; color: #000; letter-spacing: 1px; }
            .print-only-header p { margin: 0; font-size: 14px; color: #444; }
            .no-print { display: none !important; }
            .agro-container { padding: 0 !important; }
            .agro-unified-card { border: none !important; box-shadow: none !important; }
          }
        `}
      </style>

      {/* Company Header - Only visible in Print */}
      <div className="print-only-header">
        <h1>KRUSHI SEVA KENDRA</h1>
        <p>Purchase Bill / Inward Documentation</p>
      </div>

      <div className="agro-unified-card" style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-light)',
        marginTop: '5px',
        overflow: 'hidden'
      }}>
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '15px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--primary)" /> Purchase Bill: {billData.id}
            </h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Reviewing inward stock documentation</p>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-agro btn-outline" onClick={() => window.print()} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <Printer size={16} /> Print
            </button>
            <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/bills')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* General Info */}
            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: '700', color: 'var(--primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>General Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Bill Date</label>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{billData.billDate}</div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Payment Mode</label>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>{billData.paymentType}</div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Status</label>
                  <div>{getStatusBadge(billData.status)}</div>
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '13px', margin: '0 0 12px 0', fontWeight: '700', color: 'var(--primary)', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Supplier Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Supplier Name</label>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{billData.supplierName}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {billData.supplierId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Table */}
          <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="agro-table-wrapper-simple">
              <table className="agro-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Batch</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price (₹)</th>
                    <th style={{ textAlign: 'right' }}>Tax (%)</th>
                    <th style={{ textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.productName}</td>
                      <td style={{ color: '#64748b', fontSize: '12px' }}>{item.batchNo}</td>
                      <td style={{ textAlign: 'center', fontWeight: '700' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{item.purchasePrice.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#64748b' }}>{item.taxPercent}%</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>₹{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <div style={{ width: '300px', padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Sub Total:</span>
                <span style={{ fontWeight: '600' }}>₹{billData.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748b' }}>Total Tax:</span>
                <span style={{ fontWeight: '600' }}>₹{billData.taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Grand Total:</span>
                <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '16px' }}>₹{billData.grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '13px', color: '#166534' }}>
                <span>Paid Amount:</span>
                <span style={{ fontWeight: '700' }}>₹{billData.paidAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#ef4444' }}>
                <span>Due Balance:</span>
                <span style={{ fontWeight: '700' }}>₹{billData.dueAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseBill;
