import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, User, Phone, Mail, Home, Info } from 'lucide-react';
import { MockService } from '../../services/MockService';
import '../../styles/MasterModel.css';

const CustomerView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      const item = await MockService.getById('customers', id);
      if (item) {
        setFormData(item);
      } else {
        alert('Customer not found');
        navigate('/customers');
      }
      setLoading(false);
    };
    fetchItem();
  }, [id, navigate]);

  if (loading) return <div className="agro-container">Loading...</div>;
  if (!formData) return null;

  return (
    <div className="agro-container" style={{ padding: '25px 25px 0 25px' }}>
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Customer Profile</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Full overview of customer data and relationship status</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate('/customers')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <X size={16} /> Back
          </button>
        </div>

        <div style={{ display: 'flex', minHeight: '400px' }}>
          <div style={{ 
            width: '280px', 
            background: '#f8fafc', 
            padding: '30px 20px', 
            borderRight: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              background: 'white', 
              color: 'var(--primary)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '40px', 
              fontWeight: '800', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '2px solid var(--border-light)',
              marginBottom: '15px'
            }}>
              {formData.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 8px 0', textAlign: 'center' }}>{formData.name}</h2>
            <span className={`badge ${formData.isActive ? 'badge-success' : 'badge-danger'}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
              {formData.isActive ? 'Active Member' : 'Inactive'}
            </span>

            <div style={{ marginTop: '30px', width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border-light)' }}>
                  <Phone size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Mobile</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: '600' }}>{formData.mobile}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border-light)' }}>
                  <Mail size={14} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Email</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-dark)', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{formData.email || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border-light)' }}>
                  <Info size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>GSTIN</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: '600' }}>{formData.gstNo || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, padding: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Home size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>Residential Address</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <div style={{ padding: '15px', background: '#fcfcfc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px' }}>Full Address</label>
                <div style={{ fontSize: '14px', color: 'var(--text-dark)', lineHeight: '1.6', fontWeight: '500' }}>
                  {formData.address || 'No detailed address recorded.'}
                </div>
              </div>
              
              <div style={{ padding: '12px 15px', background: '#fcfcfc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Registered On</label>
                <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: '700' }}>{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerView;
