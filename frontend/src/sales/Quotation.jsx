import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react';
import '../mastermodel/styles/MasterModel.css';

import { ApiService } from '../mastermodel/services/ApiService';

const Quotation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      // Note: Backend endpoint for quotations might need to be created if not exists
      const data = await ApiService.getAll('quotations');
      setQuotations(data || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.customerName && q.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted': return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> {status}</span>;
      case 'Pending': return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {status}</span>;
      case 'Expired': return <span className="badge" style={{ background: '#fee2e2', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={12} /> {status}</span>;
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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Sales Quotations</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Create and manage price quotes for customers</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search quotations..."
                className="form-control"
                style={{ paddingLeft: '15px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: '130px', height: '38px', fontSize: '13px', borderRadius: '10px', background: '#f8fafc', border: '1px solid var(--border)' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <button className="btn-agro btn-primary" onClick={() => navigate('/sales/quotations/new')} style={{ height: '38px', padding: '0 16px' }}>
            <Plus size={18} /> New Quotation
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <div className="agro-table-container agro-table-wrapper-simple">
            <table className="agro-table">
              <thead>
                <tr>
                  <th>Qtn ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading quotations...</td></tr>
                ) : filteredQuotations.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '700', fontSize: '13px', color: '#8b5cf6' }}>{item.quotationNo || item.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{item.customer?.name || item.customerName || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {item.customerId}</div>
                    </td>
                    <td>{item.date || item.createdAt?.split('T')[0]}</td>
                    <td style={{ fontWeight: '700' }}>₹{(item.totalAmount || 0).toFixed(2)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td style={{ textAlign: 'left' }}>
                      <button
                        className="btn-agro btn-outline"
                        onClick={() => navigate('/sales/entry', { state: { quotationData: item } })}
                        style={{ padding: '4px 12px', height: '28px', fontSize: '11px' }}
                      >
                        Convert to Bill
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && filteredQuotations.length === 0 && (
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

export default Quotation;
