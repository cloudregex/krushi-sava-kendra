import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Calendar, User, CheckCircle, Package, Printer, Clock, AlertCircle } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

const ViewPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchOrderData = async () => {
      const mockMaster = {
        id: id,
        supplierId: 'SUP-102',
        supplierName: 'Green Farms Supply',
        mobile: '9881122334',
        orderDate: '2026-04-20',
        expiryDate: '2026-05-20',
        status: 'Pending',
        expectedTotal: 24500.00
      };

      const mockItems = [
        { id: 1, productName: 'DAP Fertilizer 50kg', quantity: 20, expectedPrice: 1000.00, amount: 20000.00 },
        { id: 2, productName: 'Monocrotophos 1L', quantity: 10, expectedPrice: 450.00, amount: 4500.00 }
      ];

      setOrderData(mockMaster);
      setItems(mockItems);
    };

    fetchOrderData();
  }, [id]);

  if (!orderData) {
    return <div className="agro-container flex-center" style={{ height: '50vh' }}>Loading order details...</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '11px' }}><CheckCircle size={11} /> {status}</span>;
      case 'Pending': return <span className="badge badge-warning" style={{ padding: '4px 10px', fontSize: '11px' }}><Clock size={11} /> {status}</span>;
      case 'Cancelled': return <span className="badge badge-danger" style={{ padding: '4px 10px', fontSize: '11px' }}><AlertCircle size={11} /> {status}</span>;
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
            .order-info-section { grid-template-columns: 1fr 1fr !important; }
          }
        `}
      </style>

      <div className="print-only-header">
        <h1>KRUSHI SEVA KENDRA</h1>
        <p>Market Yard, Pune - 411037 | Contact: +91 99887 76655</p>
        <p style={{ marginTop: '5px', fontWeight: 'bold', textDecoration: 'underline' }}>PURCHASE ORDER / INTENT TO BUY</p>
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Purchase Order: {orderData.id}</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Planned procurement for inventory restocking</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-agro btn-outline" onClick={() => window.print()} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <Printer size={16} /> Print
            </button>
            <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/orders')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="order-info-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                  <User size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Supplier Details</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>{orderData.supplierName}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>ID: {orderData.supplierId} | Contact: {orderData.mobile}</p>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                  <ShoppingBag size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Order Summary</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Order Date</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{orderData.orderDate}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Status</p>
                    {getStatusBadge(orderData.status)}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '10px 15px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={14} color="#92400e" />
              <p style={{ margin: 0, fontSize: '12px', color: '#92400e', fontWeight: '600' }}>Expected Delivery by: <span style={{ fontWeight: '800' }}>{orderData.expiryDate}</span></p>
            </div>

            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <table className="agro-table" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px 15px' }}>Product Details</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Ordered Qty</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Target Rate (₹)</th>
                    <th style={{ width: '150px', textAlign: 'right' }}>Sub-total (₹)</th>
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
                            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Planned Procurement</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{item.expectedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ textAlign: 'right', fontWeight: '800' }}>{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ minWidth: '320px', padding: '18px', background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '5px', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '700' }}>TOTAL ESTIMATED VALUE</p>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'var(--primary)' }}>₹{orderData.expectedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                  Prices are subject to final invoice at delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseOrder;
