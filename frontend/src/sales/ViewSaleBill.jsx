import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Share2, CheckCircle, Clock } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import '../mastermodel/styles/MasterModel.css';

const ViewSaleBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isQuiet = queryParams.get('quiet') === 'true';
  const [billData, setBillData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const printProcessed = React.useRef(false);

  useEffect(() => {
    if (isQuiet) {
      document.body.style.backgroundColor = 'white';
      return () => {
        document.body.style.backgroundColor = '';
      };
    }
  }, [isQuiet]);

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getById('sales', id);
        if (response) {
          setBillData(response.sale || response);
          setItems(response.items || []);
        }
      } catch (error) {
        console.error("Fetch Bill Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBillData();
  }, [id]);

  useEffect(() => {
    if (!loading && billData && !printProcessed.current) {
      if (queryParams.get('print') === 'true') {
        printProcessed.current = true;
        const timer = setTimeout(() => {
          console.log("Triggering Print...");
          window.focus();
          window.print();
          // After printing, if it's a standalone print tab, try to close it
          setTimeout(() => {
            // If we are in a standalone route (opened via window.open), close it
            if (window.opener || window.location.pathname.startsWith('/print/')) {
              window.close();
            } else if (queryParams.get('quiet') !== 'true') {
              // Fallback for regular view page with print=true
              navigate('/sales/bills');
            }
          }, 500);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, billData, items, location.search, navigate]);

  const calculatedTaxBreakdown = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    const hsnMap = {};
    items.forEach(child => {
      const hsn = child.product?.hsnCode || child.hsnCode || 'N/A';
      const taxP = parseFloat(child.taxPercent) || (child.product ? parseFloat(child.product.tax) : 0) || 0;
      const rowGross = (parseFloat(child.quantity) || 0) * (parseFloat(child.rate) || 0);
      const rowDisc = parseFloat(child.discount) || 0;
      const taxableVal = rowGross - rowDisc;
      const rowTax = (taxableVal * taxP) / 100;

      if (!hsnMap[hsn]) {
        hsnMap[hsn] = { hsn, taxRate: taxP, taxableVal, cgstRate: taxP / 2, sgstRate: taxP / 2, cgstAmount: rowTax / 2, sgstAmount: rowTax / 2, totalTax: rowTax };
      } else {
        hsnMap[hsn].taxableVal += taxableVal;
        hsnMap[hsn].cgstAmount += rowTax / 2;
        hsnMap[hsn].sgstAmount += rowTax / 2;
        hsnMap[hsn].totalTax += rowTax;
      }
    });
    return Object.values(hsnMap);
  }, [items]);

  // Helper: Amount in Words
  const numberToWords = (num) => {
    if (!num) return 'Zero Rupees Only';
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      let nStr = n.toString();
      if (nStr.length > 9) return 'Overflow';
      let nArr = ('000000000' + nStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
      if (!nArr) return '';
      let str = '';
      str += (Number(nArr[1]) !== 0) ? (a[Number(nArr[1])] || b[nArr[1][0]] + ' ' + a[nArr[1][1]]) + 'Crore ' : '';
      str += (Number(nArr[2]) !== 0) ? (a[Number(nArr[2])] || b[nArr[2][0]] + ' ' + a[nArr[2][1]]) + 'Lakh ' : '';
      str += (Number(nArr[3]) !== 0) ? (a[Number(nArr[3])] || b[nArr[3][0]] + ' ' + a[nArr[3][1]]) + 'Thousand ' : '';
      str += (Number(nArr[4]) !== 0) ? (a[Number(nArr[4])] || b[nArr[4][0]] + ' ' + a[nArr[4][1]]) + 'Hundred ' : '';
      str += (Number(nArr[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(nArr[5])] || b[nArr[5][0]] + ' ' + a[nArr[5][1]]) : '';
      return str;
    };

    const amount = Math.floor(num);
    const paise = Math.round((num - amount) * 100);
    let result = inWords(amount) + 'Rupees ';
    if (paise > 0) {
      result += 'and ' + inWords(paise) + 'Paise ';
    }
    return result + 'Only';
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Loading Invoice Data...</div>;
  if (!billData) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Invoice Not Found!</div>;

  return (
    <div className={`invoice-outer-wrapper ${isQuiet ? 'quiet-mode' : ''}`} style={{
      padding: isQuiet ? '0' : '20px',
      background: 'white',
      minHeight: '100vh',
      display: 'block'
    }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 5mm; }
          body, html { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important;
            -webkit-print-color-adjust: exact; 
          }
          .no-print { display: none !important; }
          .invoice-outer-wrapper { 
            padding: 0 !important; 
            background: white !important; 
            min-height: auto !important; 
            width: 100% !important;
          }
          
          .invoice-box { 
            box-shadow: none !important; 
            border: none !important; 
            margin: 0 !important; 
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            visibility: visible !important;
            display: block !important;
            border-radius: 0 !important;
          }
          .print-area { display: block !important; }

          .invoice-box * {
            visibility: visible !important;
            opacity: 1 !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
          }
          
          /* Readability & Spacing */
          h1 { font-size: 22px !important; margin: 0 !important; }
          h2 { font-size: 18px !important; margin: 0 !important; }
          h3 { font-size: 11px !important; margin-bottom: 2px !important; }
          p { font-size: 11px !important; margin: 2px 0 !important; }

          .invoice-box > div { margin-top: 10px !important; }
          .invoice-box > div:first-child { margin-top: 0 !important; padding-bottom: 5px !important; border-bottom: 2px solid #1e293b !important; }

          table, .invoice-table, .tax-breakdown-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 8px !important;
            display: table !important;
          }
          tr { display: table-row !important; page-break-inside: avoid !important; }
          th, td { display: table-cell !important; }
          
          .invoice-table tr {
            background: transparent !important;
            color: black !important;
          }
          
          .invoice-table th { 
            background: #f1f5f9 !important; 
            color: black !important; 
            border: 1px solid #000 !important; 
            padding: 6px 4px !important;
            font-size: 11px !important;
            font-weight: bold !important;
          }
          .invoice-table td { 
            border: 1px solid #000 !important; 
            padding: 6px 4px !important;
            font-size: 11px !important;
          }
          .tax-breakdown-table th, .tax-breakdown-table td { 
            border: 1px solid #000 !important; 
            padding: 4px !important;
            font-size: 9px !important;
          }
          .grand-total-section {
            background: #f8fafc !important;
            padding: 10px !important;
            border: 1px solid #000 !important;
            border-radius: 6px !important;
          }
          .grand-total-section div { font-size: 12px !important; margin-bottom: 2px !important; }
          .grand-total-section > div:nth-child(4) { 
             font-size: 18px !important; 
             padding-top: 4px !important; 
             margin-top: 4px !important; 
          }
          .terms-section { padding: 6px !important; margin-top: 6px !important; }
          .terms-section ul { margin: 0 !important; padding-left: 14px !important; font-size: 10px !important; }
          .amount-words { font-size: 11px !important; }
          .signature-section { margin-top: 15px !important; }
        }

        .invoice-box {
          background: white;
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid #e2e8f0;
          color: #1e293b;
          font-family: 'Inter', -apple-system, sans-serif;
          transition: all 0.3s ease;
        }
        .invoice-box.quiet-mode {
          max-width: 100% !important;
          margin: 0 !important;
          padding: 10mm !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
        }
        @media screen {
          .invoice-outer-wrapper.quiet-mode {
            background: white !important;
          }
          .invoice-outer-wrapper.quiet-mode * {
            display: none !important;
          }
        }
        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .invoice-table th { padding: 12px 10px; background: #1e293b; color: white; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e2e8f0; }
        .invoice-table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .tax-breakdown-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
        .tax-breakdown-table th { background: #f8fafc; padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #475569; }
        .tax-breakdown-table td { padding: 8px; border: 1px solid #e2e8f0; text-align: center; }
      `}</style>

      {/* Top Actions */}
      {!isQuiet && (
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '850px', margin: '0 auto 15px auto' }}>
          <button className="btn-agro btn-outline" onClick={() => navigate('/sales/bills')} style={{ gap: '8px' }}>
            <ArrowLeft size={18} /> Back to Bills
          </button>
        </div>
      )}

      <div className={`invoice-box print-area ${isQuiet ? 'quiet-mode' : ''}`}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1e293b', paddingBottom: '15px', breakInside: 'avoid' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#1e293b' }}>KRUSHI SEVA KENDRA</h1>
            <p style={{ margin: '5px 0', fontSize: '13px', color: '#64748b' }}>
              Dealers in: Fertilizers, Seeds & Pesticides<br />
              At Post: Market Yard, Pune, Maharashtra - 411037<br />
              <strong>Contact: +91 99887 76655 | GSTIN: 27AAAAA0000A1Z5</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px', fontWeight: '800' }}>TAX INVOICE</h2>
            <p style={{ margin: '5px 0', fontSize: '13px' }}>
              <strong>Invoice No:</strong> {billData.invoiceNo}<br />
              <strong>Date:</strong> {billData.billDate}<br />
              <strong>Status:</strong> <span style={{ color: billData.balanceAmount === 0 ? '#16a34a' : '#ef4444' }}>{billData.balanceAmount === 0 ? 'PAID' : 'PENDING'}</span>
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px', breakInside: 'avoid' }}>
          <div>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>Billed To:</h3>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{billData.customer?.name}</p>
            <p style={{ margin: '3px 0', fontSize: '13px', color: '#475569' }}>
              Mobile: {billData.customer?.mobile}<br />
              {billData.customer?.address || 'Customer Address Not Provided'}<br />
              {billData.customer?.gstNo && <strong>GSTIN: {billData.customer?.gstNo}</strong>}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {/* Additional details like Transporter or Vehicle No can go here */}
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border: '1px solid #e2e8f0' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: 'white', fontSize: '12px' }}>
              <th style={{ width: '50px', textAlign: 'center', padding: '10px', border: '1px solid #e2e8f0' }}>SR.</th>
              <th style={{ textAlign: 'left', padding: '10px', border: '1px solid #e2e8f0' }}>PRODUCT NAME</th>
              <th style={{ width: '80px', textAlign: 'center', padding: '10px', border: '1px solid #e2e8f0' }}>HSN</th>
              <th style={{ width: '80px', textAlign: 'center', padding: '10px', border: '1px solid #e2e8f0' }}>QTY</th>
              <th style={{ width: '100px', textAlign: 'right', padding: '10px', border: '1px solid #e2e8f0' }}>RATE</th>
              <th style={{ width: '80px', textAlign: 'center', padding: '10px', border: '1px solid #e2e8f0' }}>GST %</th>
              <th style={{ width: '120px', textAlign: 'right', padding: '10px', border: '1px solid #e2e8f0' }}>TOTAL (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e2e8f0' }}>{idx + 1}</td>
                <td style={{ padding: '10px', borderRight: '1px solid #e2e8f0' }}>
                  <strong>{item.product?.name}</strong>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Batch: {item.batchNo}</div>
                </td>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e2e8f0' }}>{item.product?.hsnCode || 'N/A'}</td>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e2e8f0' }}>{item.quantity} {item.unit}</td>
                <td style={{ textAlign: 'right', padding: '10px', borderRight: '1px solid #e2e8f0' }}>{(parseFloat(item.rate) || 0).toFixed(2)}</td>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e2e8f0' }}>{item.taxPercent}%</td>
                <td style={{ textAlign: 'right', fontWeight: '700', padding: '10px' }}>{(parseFloat(item.totalAmount) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', marginTop: '20px' }}>
          <div>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Amount in Words:</h3>
            <p className="amount-words" style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b', fontStyle: 'italic' }}>
              {numberToWords(billData.grandTotal)}
            </p>

            <div className="terms-section" style={{ marginTop: '20px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ fontSize: '11px', margin: '0 0 5px 0' }}>Terms & Conditions:</h3>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: '#64748b' }}>
                <li>Goods once sold will not be taken back.</li>
                <li>Interest @ 24% p.a. will be charged if not paid within due date.</li>
                <li>Subject to Pune Jurisdiction.</li>
              </ul>
            </div>
          </div>

          <div className="grand-total-section" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>Subtotal:</span>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>₹{(parseFloat(billData.subtotal) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>GST Amount:</span>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>₹{(parseFloat(billData.taxAmount) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#ef4444' }}>
              <span style={{ fontWeight: '500' }}>Total Discount:</span>
              <span style={{ fontWeight: '700' }}>- ₹{(parseFloat(billData.discountAmount) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '900', borderTop: '2px solid #1e293b', paddingTop: '12px', marginTop: '8px', color: '#0f172a' }}>
              <span>Grand Total:</span>
              <span>₹{(parseFloat(billData.grandTotal) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#16a34a' }}>
                <span style={{ fontWeight: '600' }}>Paid Amount:</span>
                <span style={{ fontWeight: '800' }}>₹{(parseFloat(billData.paidAmount) || 0).toFixed(2)}</span>
              </div>

              {/* Payment Mode Breakdown */}
              {(() => {
                const pm = billData.paymentMode;
                if (!pm) return null;
                if (typeof pm === 'string') return <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', fontStyle: 'italic' }}>(Paid via {pm})</div>;

                try {
                  const pmObj = typeof pm === 'string' ? JSON.parse(pm) : pm;
                  const modes = [];
                  if (pmObj.cash > 0) modes.push(`Cash: ₹${pmObj.cash}`);
                  if (pmObj.upi > 0) modes.push(`UPI: ₹${pmObj.upi}`);
                  if (pmObj.swipe > 0) modes.push(`Swipe: ₹${pmObj.swipe}`);

                  if (modes.length > 0) {
                    return (
                      <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px', fontStyle: 'italic' }}>
                        {modes.map((m, i) => <span key={i}>({m})</span>)}
                      </div>
                    );
                  }
                } catch (e) {
                  return null;
                }
              })()}
            </div>
            {billData.balanceAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#e11d48', background: '#fff1f2', padding: '8px 12px', borderRadius: '8px', marginTop: '8px', border: '1px solid #ffe4e6' }}>
                <span style={{ fontWeight: '600' }}>Balance Due:</span>
                <span style={{ fontWeight: '800' }}>₹{(parseFloat(billData.balanceAmount) || 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* GST Analysis Table */}
        <div style={{ marginTop: '30px', breakInside: 'avoid' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', margin: 0 }}>GST Breakdown:</h3>
            <span style={{ fontSize: '10px', fontWeight: '800', color: '#16a34a' }}>INTRA-STATE SALE (CGST + SGST)</span>
          </div>
          <table className="tax-breakdown-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '12px', border: '1px solid #e2e8f0' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#1e293b' }}>
                <th rowSpan="2" style={{ padding: '10px', border: '1px solid #e2e8f0' }}>HSN CODE</th>
                <th rowSpan="2" style={{ padding: '10px', border: '1px solid #e2e8f0' }}>TAX RATE (%)</th>
                <th colSpan="2" style={{ padding: '8px', border: '1px solid #e2e8f0' }}>CGST</th>
                <th colSpan="2" style={{ padding: '8px', border: '1px solid #e2e8f0' }}>SGST</th>
                <th rowSpan="2" style={{ padding: '10px', border: '1px solid #e2e8f0' }}>TOTAL TAX (₹)</th>
              </tr>
              <tr style={{ background: '#f8fafc', color: '#1e293b' }}>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', fontSize: '10px' }}>RATE (%)</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', fontSize: '10px' }}>AMOUNT (₹)</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', fontSize: '10px' }}>RATE (%)</th>
                <th style={{ padding: '8px', border: '1px solid #e2e8f0', fontSize: '10px' }}>AMOUNT (₹)</th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamically calculated tax breakdown */}
              {calculatedTaxBreakdown && calculatedTaxBreakdown.length > 0 ? calculatedTaxBreakdown.map((tax, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: '700', border: '1px solid #e2e8f0' }}>{tax.hsn}</td>
                  <td style={{ padding: '10px', fontWeight: '700', border: '1px solid #e2e8f0' }}>{tax.taxRate}%</td>
                  <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{tax.cgstRate.toFixed(2)}%</td>
                  <td style={{ padding: '10px', fontWeight: '600', border: '1px solid #e2e8f0' }}>{tax.cgstAmount.toFixed(2)}</td>
                  <td style={{ padding: '10px', border: '1px solid #e2e8f0' }}>{tax.sgstRate.toFixed(2)}%</td>
                  <td style={{ padding: '10px', fontWeight: '600', border: '1px solid #e2e8f0' }}>{tax.sgstAmount.toFixed(2)}</td>
                  <td style={{ padding: '10px', fontWeight: '800', color: '#166534', border: '1px solid #e2e8f0' }}>{tax.totalTax.toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ padding: '10px', fontStyle: 'italic', color: '#64748b', border: '1px solid #e2e8f0' }}>Consolidated Tax Calculation Applied</td>
                </tr>
              )}
              {/* Total Row */}
              <tr style={{ background: '#f0fdf4', fontWeight: '900', color: '#166534' }}>
                <td colSpan="3" style={{ textAlign: 'left', padding: '12px 15px', border: '1px solid #bbf7d0' }}>TOTAL</td>
                <td style={{ padding: '12px', border: '1px solid #bbf7d0' }}>₹{((parseFloat(billData.taxAmount) || 0) / 2).toFixed(2)}</td>
                <td style={{ padding: '12px', border: '1px solid #bbf7d0' }}></td>
                <td style={{ padding: '12px', border: '1px solid #bbf7d0' }}>₹{((parseFloat(billData.taxAmount) || 0) / 2).toFixed(2)}</td>
                <td style={{ padding: '12px', fontSize: '14px', border: '1px solid #bbf7d0' }}>₹{(parseFloat(billData.taxAmount) || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* Signatures */}
        <div className="signature-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '25px', padding: '0 30px', breakInside: 'avoid' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1.5px solid #1e293b', width: '160px', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#334155' }}>Customer Signature</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 30px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>For KRUSHI SEVA KENDRA</p>
            <div style={{ borderTop: '1.5px solid #1e293b', width: '200px', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#334155' }}>Authorized Signatory</p>
          </div>
        </div>
      </div>

      {!isQuiet && (
        <p className="no-print" style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '12px' }}>
          Computer Generated Invoice. No Signature Required if Printed.
        </p>
      )}
    </div>
  );
};

export default ViewSaleBill;
