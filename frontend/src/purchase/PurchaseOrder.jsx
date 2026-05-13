import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Filter, Plus, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';

import '../mastermodel/styles/MasterModel.css';

const PurchaseOrder = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    ApiService.getAll('purchase-orders')
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch(err => console.error('Error fetching orders:', err));
  }, []);

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
                  <th style={{ textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: 'var(--primary)' }}>PO-{order.id}</td>
                    <td>{order.Supplier?.name || order.supplierId}</td>
                    <td>{order.orderDate}</td>
                    <td>{order.expiryDate}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td style={{ textAlign: 'left' }}>
                      <button
                        className="btn-agro btn-outline"
                        onClick={() => navigate(`/purchase/orders/view/${order.id}`)}
                        style={{ padding: '4px 12px', height: '28px', fontSize: '11px' }}
                      >
                        View
                      </button>
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
    </div>
  );
};

export default PurchaseOrder;
