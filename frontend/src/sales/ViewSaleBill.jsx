import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Mail, Share2, CheckCircle, Clock } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import '../mastermodel/styles/MasterModel.css';

const ViewSaleBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [billData, setBillData] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const printProcessed = React.useRef(false);

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
    if (!loading && billData && items && items.length > 0 && !printProcessed.current) {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get('print') === 'true') {
        printProcessed.current = true;
        const timer = setTimeout(() => {
          window.print();
          if (queryParams.get('quiet') !== 'true') {
            navigate('/sales/bills');
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, billData, items, location.search, navigate]);

  const queryParams = new URLSearchParams(location.search);
  const isQuiet = queryParams.get('quiet') === 'true';

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
    <div className="invoice-outer-wrapper" style={{ padding: isQuiet ? '0' : '20px', background: isQuiet ? 'white' : '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .invoice-outer-wrapper { padding: 0 !important; background: white !important; }
          
          .invoice-box { 
            box-shadow: none !important; 
            border: 1px solid #000 !important; 
            margin: 0 !important; 
            width: 100% !important;
            padding: 15px !important;
            visibility: visible !important;
            display: block !important;
          }

          .invoice-box * {
            visibility: visible !important;
            opacity: 1 !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
          }
          
          table, .invoice-table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            margin-top: 15px !important;
            display: table !important;
          }
          tr { display: table-row !important; }
          th, td { display: table-cell !important; }
          
          .invoice-table th { 
            background: #f0f0f0 !important; 
            color: black !important; 
            border: 1px solid #000 !important; 
            font-size: 11px !important;
            padding: 8px !important;
            text-align: left !important;
          }
          .invoice-table td { 
            border: 1px solid #000 !important; 
            padding: 8px !important; 
            font-size: 12px !important;
          }
          .tax-breakdown-table th, .tax-breakdown-table td { 
            border: 1px solid #000 !important; 
          }
        }

        .invoice-box {
          background: white;
          max-width: 850px;
          margin: 0 auto;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 25px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          color: #1e293b;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .invoice-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .invoice-table th { padding: 12px 10px; background: #1e293b; color: white; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e2e8f0; }
        .invoice-table td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .tax-breakdown-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
        .tax-breakdown-table th { background: #f8fafc; padding: 6px; border: 1px solid #e2e8f0; text-align: center; }
        .tax-breakdown-table td { padding: 6px; border: 1px solid #e2e8f0; text-align: center; }
      `}</style>

      {/* Top Actions */}
      {!isQuiet && (
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '850px', margin: '0 auto 15px auto' }}>
          <button className="btn-agro btn-outline" onClick={() => navigate('/sales/bills')} style={{ gap: '8px' }}>
            <ArrowLeft size={18} /> Back to Bills
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-agro btn-primary" onClick={() => window.print()} style={{ gap: '8px' }}>
              <Printer size={18} /> Print Invoice
            </button>
          </div>
        </div>
      )}

      <div className="invoice-box" style={{ 
        boxShadow: isQuiet ? 'none' : '0 4px 25px rgba(0,0,0,0.1)', 
        border: isQuiet ? 'none' : '1px solid #e2e8f0',
        padding: isQuiet ? '20px' : '40px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1e293b', paddingBottom: '15px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
          <div>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px', letterSpacing: '1px' }}>Billed To:</h3>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>{billData.customer?.name}</p>
            <p style={{ margin: '3px 0', fontSize: '13px', color: '#475569' }}>
              Mobile: {billData.customer?.mobile}<br />
              {billData.customer?.address || 'Customer Address Not Provided'}<br />
              {billData.customer?.gstNo && <strong>GSTIN: {billData.customer?.gstNo}</strong>}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Sr.</th>
              <th>Product Name</th>
              <th style={{ width: '80px' }}>HSN</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Rate</th>
              <th style={{ width: '80px', textAlign: 'right' }}>GST %</th>
              <th style={{ width: '120px', textAlign: 'right' }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                <td>
                  <strong>{item.product?.name}</strong>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>Batch: {item.batchNo}</div>
                </td>
                <td>{item.product?.hsnCode || 'N/A'}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity} {item.unit}</td>
                <td style={{ textAlign: 'right' }}>{(parseFloat(item.rate) || 0).toFixed(2)}</td>
                <td style={{ textAlign: 'right' }}>{item.taxPercent}%</td>
                <td style={{ textAlign: 'right', fontWeight: '700' }}>{(parseFloat(item.totalAmount) || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Calculation Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', marginTop: '20px' }}>
          <div>
            <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Amount in Words:</h3>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1e293b', fontStyle: 'italic' }}>
              {numberToWords(billData.grandTotal)}
            </p>

            <div style={{ marginTop: '20px', padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ fontSize: '11px', margin: '0 0 5px 0' }}>Terms & Conditions:</h3>
              <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '10px', color: '#64748b' }}>
                <li>Goods once sold will not be taken back.</li>
                <li>Interest @ 24% p.a. will be charged if not paid within due date.</li>
                <li>Subject to Pune Jurisdiction.</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '700' }}>₹{(parseFloat(billData.subtotal) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span>GST Amount:</span>
              <span style={{ fontWeight: '700' }}>₹{(parseFloat(billData.taxAmount) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ef4444' }}>
              <span>Total Discount:</span>
              <span style={{ fontWeight: '700' }}>- ₹{(parseFloat(billData.discountAmount) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: '900', borderTop: '2px solid #1e293b', paddingTop: '8px', marginTop: '5px' }}>
              <span>Grand Total:</span>
              <span>₹{(parseFloat(billData.grandTotal) || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a' }}>
                <span>Paid Amount:</span>
                <span style={{ fontWeight: '800' }}>₹{(parseFloat(billData.paidAmount) || 0).toFixed(2)}</span>
              </div>
              
              {/* Payment Mode Breakdown */}
              {(() => {
                const pm = billData.paymentMode;
                if (!pm) return null;
                if (typeof pm === 'string') return <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right' }}>(Paid via {pm})</div>;
                
                try {
                  const parsed = typeof pm === 'string' ? JSON.parse(pm) : pm;
                  const modes = [];
                  if (parsed.cash > 0) modes.push(`Cash: ₹${parsed.cash.toFixed(2)}`);
                  if (parsed.upi > 0) modes.push(`UPI: ₹${parsed.upi.toFixed(2)}`);
                  if (parsed.swipe > 0) modes.push(`Swipe: ₹${parsed.swipe.toFixed(2)}`);
                  
                  if (modes.length > 0) {
                    return (
                      <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#e11d48', background: '#fff1f2', padding: '5px', borderRadius: '4px' }}>
                <span>Balance Due:</span>
                <span style={{ fontWeight: '800' }}>₹{(parseFloat(billData.balanceAmount) || 0).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* GST Analysis Table */}
        <div style={{ marginTop: '30px' }}>
           <h3 style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', marginBottom: '5px' }}>GST Breakdown:</h3>
           <table className="tax-breakdown-table">
             <thead>
               <tr>
                 <th>HSN/SAC</th>
                 <th>Taxable Value</th>
                 <th>CGST %</th>
                 <th>CGST Amt</th>
                 <th>SGST %</th>
                 <th>SGST Amt</th>
                 <th>Total Tax</th>
               </tr>
             </thead>
             <tbody>
               {billData.taxBreakdown ? billData.taxBreakdown.map((tax, i) => (
                 <tr key={i}>
                   <td>{tax.hsn}</td>
                   <td>{(tax.taxableVal || 0).toFixed(2)}</td>
                   <td>{tax.cgstRate}%</td>
                   <td>{tax.cgstAmount.toFixed(2)}</td>
                   <td>{tax.sgstRate}%</td>
                   <td>{tax.sgstAmount.toFixed(2)}</td>
                   <td>{tax.totalTax.toFixed(2)}</td>
                 </tr>
               )) : (
                 <tr>
                   <td colSpan="7">Consolidated Tax Calculation Applied</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>

        {/* Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '60px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ borderTop: '1px solid #cbd5e1', width: '150px', margin: '0 auto 10px auto' }}></div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Customer Signature</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 35px 0', fontSize: '12px', fontWeight: '800' }}>For KRUSHI SEVA KENDRA</p>
            <div style={{ borderTop: '1px solid #cbd5e1', width: '180px', margin: '0 auto 10px auto' }}></div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Authorized Signatory</p>
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
