import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import '../mastermodel/styles/MasterModel.css';

const ViewQuotation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isQuiet = queryParams.get('quiet') === 'true';
  const [qtnData, setQtnData] = useState(null);
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
    const fetchQtnData = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getById('quotations', id);
        if (response) {
          setQtnData(response.quotation || response);
          setItems(response.items || []);
        }
      } catch (error) {
        console.error("Fetch Quotation Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQtnData();
  }, [id]);

  useEffect(() => {
    if (!loading && qtnData && !printProcessed.current) {
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
              navigate('/sales/quotations');
            }
          }, 1000);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, qtnData]);

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

  const roundOff = React.useMemo(() => {
    if (!qtnData) return 0;
    const sub = parseFloat(qtnData.subtotal) || 0;
    const tax = parseFloat(qtnData.taxAmount) || 0;
    const disc = parseFloat(qtnData.discountAmount) || 0;
    const grand = parseFloat(qtnData.grandTotal) || 0;
    return parseFloat((grand - (sub + tax - disc)).toFixed(2));
  }, [qtnData]);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#8b5cf6', fontWeight: 'bold' }}>
        Loading Quotation Details...
      </div>
    );
  }

  if (!qtnData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px', color: '#ef4444', fontWeight: 'bold' }}>
        Quotation Not Found!
      </div>
    );
  }

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
          
          h1 { font-size: 22px !important; margin: 0 !important; }
          h2 { font-size: 18px !important; margin: 0 !important; }
          h3 { font-size: 11px !important; margin-bottom: 2px !important; }
          p { font-size: 11px !important; margin: 2px 0 !important; }

          .invoice-box > div { margin-top: 10px !important; }
          .invoice-box > div:first-child { margin-top: 0 !important; padding-bottom: 5px !important; border-bottom: 2px solid #000 !important; }

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
          .tax-breakdown-table th {
            background: #f1f5f9 !important;
          }
          .grand-total-section {
            background: white !important;
            padding: 10px !important;
            border: 1px solid #000 !important;
            border-radius: 6px !important;
          }
          .grand-total-section div { font-size: 12px !important; margin-bottom: 2px !important; }
          .grand-total-section > div:nth-child(5) { 
             font-size: 18px !important; 
             padding-top: 4px !important; 
             margin-top: 4px !important; 
          }
          .terms-section { 
            background: white !important;
            border: 1px dashed #000 !important;
            padding: 6px !important; 
            margin-top: 6px !important; 
          }
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
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.08);
          border: 1px solid #e9d5ff;
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
        .invoice-table th { padding: 12px 10px; background: #8b5cf6; color: white; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e9d5ff; }
        .invoice-table td { padding: 12px 10px; border-bottom: 1px solid #e9d5ff; font-size: 14px; }
        .tax-breakdown-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
        .tax-breakdown-table th { background: #f5f3ff; padding: 8px; border: 1px solid #e9d5ff; text-align: center; color: #6b21a8; }
        .tax-breakdown-table td { padding: 8px; border: 1px solid #e9d5ff; text-align: center; }
        .terms-section {
          background: #f5f3ff;
          border: 1px dashed #c084fc;
        }
        .grand-total-section {
          border: 1px solid #e9d5ff;
          background: #fcfaff;
        }
      `}</style>

      {/* Top Actions */}
      {!isQuiet && (
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '850px', margin: '0 auto 15px auto' }}>
          <button className="btn-agro btn-outline" onClick={() => navigate('/sales/quotations')} style={{ gap: '8px' }}>
            <ArrowLeft size={18} /> Back to Quotations
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn-agro btn-outline"
              onClick={() => {
                if (qtnData.status === 'Accepted') return;
                navigate('/sales/entry', { state: { quotationData: qtnData } });
              }}
              disabled={qtnData.status === 'Accepted'}
              style={{
                gap: '8px',
                borderColor: qtnData.status === 'Accepted' ? '#d1d5db' : '#8b5cf6',
                color: qtnData.status === 'Accepted' ? '#9ca3af' : '#8b5cf6',
                opacity: qtnData.status === 'Accepted' ? 0.6 : 1,
                cursor: qtnData.status === 'Accepted' ? 'not-allowed' : 'pointer'
              }}
            >
              {qtnData.status === 'Accepted' ? '✓ Converted' : 'Convert to Bill'}
            </button>
            <button className="btn-agro btn-primary" onClick={() => window.print()} style={{ gap: '8px', background: '#8b5cf6' }}>
              <Printer size={18} /> Print Quotation
            </button>
          </div>
        </div>
      )}

      <div className={`invoice-box print-area ${isQuiet ? 'quiet-mode' : ''}`}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #8b5cf6', paddingBottom: '15px', breakInside: 'avoid' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: '#7c3aed' }}>KRUSHI SEVA KENDRA</h1>
            <p style={{ margin: '5px 0', fontSize: '13px', color: '#6b21a8' }}>
              Dealers in: Fertilizers, Seeds & Pesticides<br />
              At Post: Market Yard, Pune, Maharashtra - 411037<br />
              <strong>Contact: +91 99887 76655 | GSTIN: 27AAAAA0000A1Z5</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, color: '#7c3aed', fontSize: '22px', fontWeight: '800' }}>QUOTATION ESTIMATE</h2>
            <p style={{ margin: '5px 0', fontSize: '13px' }}>
              <strong>Quotation No:</strong> {qtnData.quotationNo}<br />
              <strong>Date:</strong> {qtnData.date}<br />
              <strong>Valid Until:</strong> <span style={{ color: '#7c3aed', fontWeight: '700' }}>{qtnData.validUntil || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px', breakInside: 'avoid' }}>
          <div>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '8px', letterSpacing: '1px' }}>Quotation Prepared For:</h3>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{qtnData.customer?.name}</p>
            <p style={{ margin: '3px 0', fontSize: '13px', color: '#475569' }}>
              Mobile: {qtnData.customer?.mobile}<br />
              {qtnData.customer?.address || 'Customer Address Not Provided'}<br />
              {qtnData.customer?.gstNo && <strong>GSTIN: {qtnData.customer?.gstNo}</strong>}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border: '1px solid #e9d5ff' }}>
          <thead>
            <tr style={{ color: 'white', fontSize: '12px' }}>
              <th style={{ width: '50px', textAlign: 'center', padding: '10px', border: '1px solid #e9d5ff' }}>SR.</th>
              <th style={{ textAlign: 'left', padding: '10px', border: '1px solid #e9d5ff' }}>PRODUCT NAME</th>
              <th style={{ width: '80px', textAlign: 'center', padding: '10px', border: '1px solid #e9d5ff' }}>HSN</th>
              <th style={{ width: '80px', textAlign: 'center', padding: '10px', border: '1px solid #e9d5ff' }}>QTY</th>
              <th style={{ width: '100px', textAlign: 'right', padding: '10px', border: '1px solid #e9d5ff' }}>RATE</th>
              <th style={{ width: '80px', textAlign: 'center', padding: '10px', border: '1px solid #e9d5ff' }}>GST %</th>
              <th style={{ width: '120px', textAlign: 'right', padding: '10px', border: '1px solid #e9d5ff' }}>TOTAL (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e9d5ff' }}>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e9d5ff' }}>{idx + 1}</td>
                <td style={{ padding: '10px', borderRight: '1px solid #e9d5ff' }}>
                  <strong>{item.product?.name}</strong>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Batch: {item.batchNo}</div>
                </td>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e9d5ff' }}>{item.product?.hsnCode || 'N/A'}</td>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e9d5ff' }}>{item.quantity} {item.unit}</td>
                <td style={{ textAlign: 'right', padding: '10px', borderRight: '1px solid #e9d5ff' }}>{(parseFloat(item.rate) || 0).toFixed(2)}</td>
                <td style={{ textAlign: 'center', padding: '10px', borderRight: '1px solid #e9d5ff' }}>{item.taxPercent}%</td>
                <td style={{ textAlign: 'right', fontWeight: '700', padding: '10px' }}>{(parseFloat(item.totalAmount) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', marginTop: '20px' }}>
          <div>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '8px' }}>Amount in Words:</h3>
            <p className="amount-words" style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#7c3aed', fontStyle: 'italic' }}>
              {numberToWords(qtnData.grandTotal)}
            </p>

            <div className="terms-section" style={{ marginTop: '20px', padding: '10px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '11px', margin: '0 0 5px 0', color: '#7c3aed' }}>Terms & Conditions:</h3>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: '#6b21a8' }}>
                <li>This is a price estimate only. Prices are subject to change.</li>
                <li>Rates quoted are valid only until the expiry date of this quotation.</li>
                <li>Subject to Pune Jurisdiction.</li>
              </ul>
            </div>
          </div>

          <div className="grand-total-section" style={{ borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#6b21a8', fontWeight: '500' }}>Subtotal:</span>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>₹{(parseFloat(qtnData.subtotal) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
              <span style={{ color: '#6b21a8', fontWeight: '500' }}>GST Amount:</span>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>₹{(parseFloat(qtnData.taxAmount) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#ef4444' }}>
              <span style={{ fontWeight: '500' }}>Total Discount:</span>
              <span style={{ fontWeight: '700' }}>- ₹{(parseFloat(qtnData.discountAmount) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: roundOff < 0 ? '#16a34a' : roundOff > 0 ? '#7c3aed' : '#6b21a8' }}>
              <span style={{ fontWeight: '500' }}>Round Off:</span>
              <span style={{ fontWeight: '700' }}>
                {roundOff < 0 ? `- ₹${Math.abs(roundOff).toFixed(2)}` : roundOff > 0 ? `+ ₹${roundOff.toFixed(2)}` : `₹0.00`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '900', borderTop: '2px solid #8b5cf6', paddingTop: '12px', marginTop: '8px', color: '#7c3aed' }}>
              <span>Grand Total:</span>
              <span>₹{(parseFloat(qtnData.grandTotal) || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* GST breakdown table */}
        <div style={{ marginTop: '30px', breakInside: 'avoid' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '8px', letterSpacing: '1px' }}>HSN / Tax Breakdown</h3>
          <table className="tax-breakdown-table">
            <thead>
              <tr>
                <th rowSpan="2" style={{ border: '1px solid #e9d5ff' }}>HSN</th>
                <th rowSpan="2" style={{ border: '1px solid #e9d5ff' }}>Taxable Value</th>
                <th colSpan="2" style={{ border: '1px solid #e9d5ff' }}>CGST</th>
                <th colSpan="2" style={{ border: '1px solid #e9d5ff' }}>SGST</th>
                <th rowSpan="2" style={{ border: '1px solid #e9d5ff' }}>Total GST</th>
              </tr>
              <tr>
                <th style={{ border: '1px solid #e9d5ff' }}>Rate</th>
                <th style={{ border: '1px solid #e9d5ff' }}>Amount</th>
                <th style={{ border: '1px solid #e9d5ff' }}>Rate</th>
                <th style={{ border: '1px solid #e9d5ff' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {calculatedTaxBreakdown.length > 0 ? calculatedTaxBreakdown.map((tax, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: '700', padding: '10px', border: '1px solid #e9d5ff' }}>{tax.hsn}</td>
                  <td style={{ padding: '10px', fontWeight: '600', border: '1px solid #e9d5ff' }}>{tax.taxableVal.toFixed(2)}</td>
                  <td style={{ padding: '10px', border: '1px solid #e9d5ff' }}>{tax.cgstRate.toFixed(2)}%</td>
                  <td style={{ padding: '10px', fontWeight: '600', border: '1px solid #e9d5ff' }}>{tax.cgstAmount.toFixed(2)}</td>
                  <td style={{ padding: '10px', border: '1px solid #e9d5ff' }}>{tax.sgstRate.toFixed(2)}%</td>
                  <td style={{ padding: '10px', fontWeight: '600', border: '1px solid #e9d5ff' }}>{tax.sgstAmount.toFixed(2)}</td>
                  <td style={{ padding: '10px', fontWeight: '800', color: '#7c3aed', border: '1px solid #e9d5ff' }}>{tax.totalTax.toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ padding: '10px', fontStyle: 'italic', color: '#7c3aed', border: '1px solid #e9d5ff' }}>Consolidated Tax Calculation Applied</td>
                </tr>
              )}
              {/* Total Row */}
              <tr style={{ background: '#f5f3ff', fontWeight: '900', color: '#7c3aed' }}>
                <td colSpan="3" style={{ textAlign: 'left', padding: '12px 15px', border: '1px solid #ddd6fe' }}>TOTAL</td>
                <td style={{ padding: '12px', border: '1px solid #ddd6fe' }}>₹{((parseFloat(qtnData.taxAmount) || 0) / 2).toFixed(2)}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd6fe' }}></td>
                <td style={{ padding: '12px', border: '1px solid #ddd6fe' }}>₹{((parseFloat(qtnData.taxAmount) || 0) / 2).toFixed(2)}</td>
                <td style={{ padding: '12px', fontSize: '14px', border: '1px solid #ddd6fe' }}>₹{(parseFloat(qtnData.taxAmount) || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="signature-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '25px', padding: '0 30px', breakInside: 'avoid' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1.5px solid #8b5cf6', width: '160px', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#6b21a8' }}>Customer Signature</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 30px 0', fontSize: '13px', fontWeight: '800', color: '#7c3aed' }}>For KRUSHI SEVA KENDRA</p>
            <div style={{ borderTop: '1.5px solid #8b5cf6', width: '200px', marginBottom: '8px' }}></div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#6b21a8' }}>Authorized Signatory</p>
          </div>
        </div>
      </div>

      {!isQuiet && (
        <p className="no-print" style={{ textAlign: 'center', marginTop: '20px', color: '#7c3aed', fontSize: '12px' }}>
          Computer Generated Quotation Estimate. No Signature Required if Printed.
        </p>
      )}
    </div>
  );
};

export default ViewQuotation;
