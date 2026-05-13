import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Calendar, User, CheckCircle, Package, Printer, Clock, AlertCircle } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import '../mastermodel/styles/MasterModel.css';

const ViewPurchaseOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const data = await ApiService.getById('purchase-orders', id);
        if (data) {
          setOrderData({
            ...data,
            supplierName: data.Supplier?.name || 'N/A',
            mobile: data.Supplier?.contact || 'N/A'
          });
          setItems(data.items || []);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      }
    };

    fetchOrderData();
  }, [id]);

  const location = React.useMemo(() => window.location, []);
  const printProcessed = React.useRef(false);

  useEffect(() => {
    if (orderData && !printProcessed.current) {
      const queryParams = new URLSearchParams(location.search);
      if (queryParams.get('print') === 'true') {
        printProcessed.current = true;
        setTimeout(() => {
          window.print();
          navigate('/purchase/orders');
        }, 500);
      }
    }
  }, [orderData, location.search, navigate]);

  const queryParams = new URLSearchParams(location.search);
  const isQuiet = queryParams.get('quiet') === 'true';

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
    <div className="agro-container print-area" style={{ 
      padding: isQuiet ? '0' : '0 25px',
      background: isQuiet ? 'white' : 'transparent'
    }}>
      <style>
        {`
          @media screen {
            .print-only-header { display: ${isQuiet ? 'block' : 'none'} !important; }
            .no-print { display: ${isQuiet ? 'none' : 'block'} !important; }
            .agro-unified-card { 
              box-shadow: ${isQuiet ? 'none' : 'var(--shadow)'} !important; 
              border: ${isQuiet ? 'none' : '1px solid var(--border-light)'} !important; 
              margin: ${isQuiet ? '0' : '5px auto'} !important; 
            }
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
        boxShadow: isQuiet ? 'none' : 'var(--shadow)',
        border: isQuiet ? 'none' : '1px solid var(--border-light)',
        marginTop: isQuiet ? '0' : '5px',
        overflow: 'hidden'
      }}>
        {!isQuiet && (
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
              <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/orders')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
                <ArrowLeft size={16} /> Back
              </button>
            </div>
          </div>
        )}

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
                    <th style={{ width: '150px', textAlign: 'center' }}>Ordered Qty</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseOrder;
