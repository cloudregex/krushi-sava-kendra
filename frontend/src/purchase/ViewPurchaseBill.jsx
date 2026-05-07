import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, User, Package, IndianRupee, Printer, CheckCircle, Clock } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';

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

  const getTaxBreakdown = () => {
    const breakdown = {};
    items.forEach(item => {
      const hsn = item.hsnCode || '31021000';
      const rate = item.taxPercent || 0;
      const taxableValue = (item.purchasePrice / (1 + (rate / 100))) * (item.altQuantity || item.quantity);
      const totalTax = (taxableValue * rate) / 100;
      
      if (!breakdown[hsn]) {
        breakdown[hsn] = {
          hsn,
          taxableValue: 0,
          cgstRate: (rate / 2).toFixed(2),
          cgstAmount: 0,
          sgstRate: (rate / 2).toFixed(2),
          sgstAmount: 0,
          totalTax: 0
        };
      }
      
      breakdown[hsn].taxableValue += taxableValue;
      breakdown[hsn].cgstAmount += totalTax / 2;
      breakdown[hsn].sgstAmount += totalTax / 2;
      breakdown[hsn].totalTax += totalTax;
    });
    return Object.values(breakdown);
  };

  const numberToWords = (num) => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
      return '';
    };

    const whole = Math.floor(num);
    const fraction = Math.round((num - whole) * 100);
    let res = inWords(whole) + 'Rupees ';
    if (fraction > 0) {
      res += 'and ' + inWords(fraction) + 'Paise ';
    }
    return res + 'Only';
  };

  return (
    <div className="agro-container print-area" style={{ padding: '0 10px', background: '#f1f5f9', minHeight: '100vh' }}>
      <style>
        {`
          .invoice-box {
            max-width: 1000px;
            margin: 20px auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 13px;
            line-height: 24px;
            font-family: 'Inter', sans-serif;
            color: #333;
            background: white;
            border-radius: 8px;
          }
          
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          
          .invoice-table th, .invoice-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          
          .invoice-table th {
            background-color: #f8fafc;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
          }

          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          
          .summary-table td {
            border: 1px solid #ddd;
            padding: 5px 10px;
          }

          @media print {
            @page {
              size: auto;
              margin: 5mm;
            }
            body { 
              background: white; 
              margin: 0;
              padding: 0;
            }
            .no-print { display: none !important; }
            .invoice-box { 
              box-shadow: none; 
              border: none; 
              margin: 0; 
              padding: 0;
              width: 100%;
              max-width: 100%;
              font-size: 11px; /* Reduced font size for print */
            }
            .agro-container { padding: 0 !important; background: white !important; }
            .invoice-table { margin-top: 10px; }
            .invoice-table th, .invoice-table td { padding: 4px 6px; } /* Compact padding */
            h1 { font-size: 20px !important; }
            h2 { font-size: 14px !important; }
            .invoice-box h3 { font-size: 10px !important; margin-bottom: 5px !important; }
            .summary-table { margin-top: 5px; }
            table { page-break-inside: avoid; }
          }
        `}
      </style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '15px 0', maxWidth: '1000px', margin: '0 auto' }}>
        <button className="btn-agro btn-primary" onClick={() => window.print()} style={{ background: 'var(--primary)', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={18} /> Print Bill
        </button>
        <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/bills')} style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="invoice-box">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#000', fontWeight: '900', letterSpacing: '1px' }}>KRUSHI SEVA KENDRA</h1>
          <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>Market Yard, Pune - 411037 | GSTIN: 27AABCK1234F1Z5</p>
          <h2 style={{ margin: '10px 0 0', fontSize: '18px', textDecoration: 'underline' }}>PURCHASE BILL / TAX INVOICE</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '5px', marginBottom: '10px' }}>Supplier Details</h3>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{billData.supplierName}</p>
            <p style={{ margin: '2px 0', color: '#555' }}>GSTIN: 27SUPPL1234G1Z1</p>
            <p style={{ margin: '2px 0', color: '#555' }}>Supplier ID: {billData.supplierId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '2px 0' }}><strong>Invoice No:</strong> {billData.id}</p>
            <p style={{ margin: '2px 0' }}><strong>Date:</strong> {billData.billDate}</p>
            <p style={{ margin: '2px 0' }}><strong>Payment Mode:</strong> {billData.paymentType}</p>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>Sl No.</th>
              <th>Description of Goods</th>
              <th style={{ width: '80px' }}>HSN/SAC</th>
              <th style={{ width: '60px', textAlign: 'center' }}>GST Rate</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Quantity</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Rate (Incl.)</th>
              <th style={{ width: '80px', textAlign: 'right' }}>Rate</th>
              <th style={{ width: '60px', textAlign: 'center' }}>per</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const rate = item.taxPercent || 0;
              const taxableRate = (item.purchasePrice / (1 + (rate / 100))).toFixed(2);
              const rowAmount = (taxableRate * (item.altQuantity || item.quantity)).toFixed(2);
              return (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{index + 1}</td>
                  <td>
                    <strong>{item.productName}</strong>
                    <div style={{ fontSize: '10px', color: '#666' }}>Batch: {item.batchNo}</div>
                  </td>
                  <td>{item.hsnCode || '31021000'}</td>
                  <td style={{ textAlign: 'center' }}>{item.taxPercent}%</td>
                  <td style={{ textAlign: 'center' }}>{item.altQuantity || item.quantity} {item.unit || 'Bag'}</td>
                  <td style={{ textAlign: 'right' }}>{item.purchasePrice.toFixed(2)}</td>
                  <td style={{ textAlign: 'right' }}>{taxableRate}</td>
                  <td style={{ textAlign: 'center' }}>{item.unit || 'Bag'}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{rowAmount}</td>
                </tr>
              );
            })}
            

          </tbody>
          <tfoot>
            <tr>
              <td colSpan="7" style={{ border: 'none', borderTop: '1px solid #ddd' }}></td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>SubTotal</td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>{billData.totalAmount.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="7" style={{ border: 'none' }}></td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>CGST</td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>{(billData.taxAmount / 2).toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan="7" style={{ border: 'none' }}></td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>SGST</td>
              <td style={{ textAlign: 'right', fontWeight: '700' }}>{(billData.taxAmount / 2).toFixed(2)}</td>
            </tr>
            {billData.grandTotal % 1 !== 0 && (
              <tr>
                <td colSpan="7" style={{ border: 'none' }}></td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>Round Off</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>{ (Math.round(billData.grandTotal) - billData.grandTotal).toFixed(2) }</td>
              </tr>
            )}
            <tr style={{ background: '#f8fafc' }}>
              <td colSpan="7" style={{ textAlign: 'right', border: 'none', fontWeight: '900', fontSize: '14px' }}>Total</td>
              <td style={{ border: 'none', borderTop: '2px solid #333' }}></td>
              <td style={{ textAlign: 'right', fontWeight: '900', fontSize: '16px', borderTop: '2px solid #333' }}>₹{Math.round(billData.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>

        <div style={{ marginTop: '20px' }}>
          <p style={{ margin: 0 }}><strong>Amount Chargeable (in words):</strong></p>
          <p style={{ margin: '5px 0', fontSize: '14px', fontWeight: '800', textTransform: 'capitalize' }}>INR {numberToWords(Math.round(billData.grandTotal))}</p>
        </div>

        <table className="invoice-table" style={{ marginTop: '30px', fontSize: '11px' }}>
          <thead>
            <tr>
              <th>HSN/SAC</th>
              <th style={{ textAlign: 'right' }}>Taxable Value</th>
              <th colSpan="2" style={{ textAlign: 'center' }}>CGST</th>
              <th colSpan="2" style={{ textAlign: 'center' }}>SGST/UTGST</th>
              <th style={{ textAlign: 'right' }}>Total Tax Amount</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th style={{ textAlign: 'center', width: '60px' }}>Rate</th>
              <th style={{ textAlign: 'center', width: '80px' }}>Amount</th>
              <th style={{ textAlign: 'center', width: '60px' }}>Rate</th>
              <th style={{ textAlign: 'center', width: '80px' }}>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {getTaxBreakdown().map((tax, i) => (
              <tr key={i}>
                <td>{tax.hsn}</td>
                <td style={{ textAlign: 'right' }}>{tax.taxableValue.toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{tax.cgstRate}%</td>
                <td style={{ textAlign: 'right' }}>{tax.cgstAmount.toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{tax.sgstRate}%</td>
                <td style={{ textAlign: 'right' }}>{tax.sgstAmount.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>{tax.totalTax.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: '800' }}>
              <td style={{ textAlign: 'right' }}>Total</td>
              <td style={{ textAlign: 'right' }}>{billData.totalAmount.toFixed(2)}</td>
              <td></td>
              <td style={{ textAlign: 'right' }}>{(billData.taxAmount / 2).toFixed(2)}</td>
              <td></td>
              <td style={{ textAlign: 'right' }}>{(billData.taxAmount / 2).toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>{billData.taxAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style={{ marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', color: '#666', marginBottom: '15px' }}>Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
            <div style={{ marginTop: '20px', borderTop: '1px solid #333', width: '180px', textAlign: 'center', paddingTop: '5px' }}>Receiver's Signature</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: '800', marginBottom: '20px' }}>for KRUSHI SEVA KENDRA</p>
            <div style={{ marginTop: '15px', display: 'inline-block', borderTop: '1px solid #333', width: '180px', textAlign: 'center', paddingTop: '5px' }}>Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseBill;
