import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Filter, Plus, Calendar, User, CheckCircle, Clock, AlertCircle, Eye, Printer, Edit, Trash2 } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import toast from 'react-hot-toast';

import '../mastermodel/styles/MasterModel.css';

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    ApiService.getAll('purchase-orders')
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(err => console.error('Error fetching orders:', err));
  };

  const [confirmModal, setConfirmModal] = useState({ show: false, id: null });

  const handleDelete = async (id) => {
    setConfirmModal({ show: true, id });
  };

  const confirmDelete = async () => {
    const { id } = confirmModal;
    setConfirmModal({ show: false, id: null });
    try {
      await ApiService.delete('purchase-orders', id);
      toast.success("Purchase order deleted successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const handlePrint = (id) => {
    toast.loading("Preparing print...", { id: "print-toast" });
    const iframeId = 'print-iframe';
    let iframe = document.getElementById(iframeId);
    if (iframe) {
      document.body.removeChild(iframe);
    }
    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.src = `/purchase/orders/view/${id}?print=true&quiet=true`;
    document.body.appendChild(iframe);
    
    setTimeout(() => {
      toast.dismiss("print-toast");
    }, 2000);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = String(o.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.Supplier?.name && o.Supplier.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(o.supplierId).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> {status}</span>;
      case 'Pending': return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {status}</span>;
      case 'Cancelled': return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {status}</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="agro-container">
      <div className="agro-unified-card">
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 25px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div style={{ flexShrink: 0 }}>
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Purchase Orders</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Manage your inventory orders and suppliers</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search orders..."
                className="form-control"
                style={{ paddingLeft: '15px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: '130px', height: '40px', fontSize: '13px', borderRadius: '10px', background: '#f8fafc', border: '1px solid var(--border)', padding: '0 12px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button className="btn-agro btn-primary" onClick={() => navigate('/purchase/orders/new')} style={{ height: '38px', padding: '0 16px' }}>
            <Plus size={18} /> New Order
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Supplier Name</th>
                  <th>Order Date</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>PO-{new Date(order.orderDate || order.createdAt).getFullYear()}-{String(order.id).padStart(6, '0')}</td>
                    <td>{order.Supplier?.name || order.supplierId}</td>
                    <td>{order.orderDate}</td>
                    <td>{order.expiryDate}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn-action view"
                          title="View"
                          onClick={() => navigate(`/purchase/orders/view/${order.id}`)}
                          style={{ color: '#3b82f6', background: '#eff6ff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-action print"
                          title="Print"
                          onClick={() => handlePrint(order.id)}
                          style={{ color: '#10b981', background: '#ecfdf5', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          className="btn-action edit"
                          title="Edit"
                          onClick={() => navigate(`/purchase/orders/edit/${order.id}`)}
                          style={{ color: '#f59e0b', background: '#fffbeb', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-action delete"
                          title="Delete"
                          onClick={() => handleDelete(order.id)}
                          style={{ color: '#ef4444', background: '#fef2f2', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {confirmModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#ef4444'
            }}>
              <Trash2 size={30} />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>Confirm Delete?</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '25px' }}>
              Are you sure you want to delete this purchase order? <br/>
              <strong style={{ color: '#ef4444' }}>This action cannot be undone.</strong>
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setConfirmModal({ show: false, id: null })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.target.style.background = '#f8fafc'}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Yes, Delete
              </button>
            </div>
          </div>
          
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(20px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrder;
