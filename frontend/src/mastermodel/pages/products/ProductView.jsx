import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Layers, DollarSign, Calendar } from 'lucide-react';
import { MockService } from '../../services/MockService';
import '../../styles/MasterModel.css';

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      const item = await MockService.getById('products', id);
      if (item) {
        setFormData(item);
      } else {
        alert('Product not found');
        navigate('/products');
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Product Details</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Full technical and commercial specifications</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate('/products')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
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
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid var(--border-light)',
              marginBottom: '15px'
            }}>
              <Package size={40} />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)', margin: '0 0 4px 0', textAlign: 'center' }}>{formData.name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '15px' }}>Code: {formData.code}</div>
            <span className={`badge ${formData.isActive ? 'badge-success' : 'badge-danger'}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div style={{ flex: 1, padding: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <Layers size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)', margin: 0 }}>General Specifications</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
              <div style={{ padding: '12px 15px', background: '#fcfcfc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Category</label>
                <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: '700' }}>{formData.category}</div>
              </div>

              <div style={{ padding: '12px 15px', background: '#fcfcfc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Company</label>
                <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: '700' }}>{formData.company || 'N/A'}</div>
              </div>

              <div style={{ padding: '12px 15px', background: '#fcfcfc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Unit Conversion</label>
                <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: '700' }}>
                  1 {formData.primaryUnit} = {formData.conversionFactor} {formData.secondaryUnit}
                </div>
              </div>

              <div style={{ padding: '12px 15px', background: '#fcfcfc', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Registered On</label>
                <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: '700' }}>{formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'N/A'}</div>
              </div>

              <div style={{ padding: '12px 15px', background: '#fcfcfc', borderRadius: '10px', border: '1px solid var(--border-light)', gridColumn: 'span 2' }}>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Current Stock Inventory</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '20px', color: Number(formData.currentStock) <= Number(formData.minStock) ? '#ef4444' : '#16a34a', fontWeight: '800' }}>
                    {formData.currentStock || 0} {formData.secondaryUnit}
                  </div>
                  {Number(formData.currentStock) <= Number(formData.minStock) && (
                    <span className="badge badge-danger" style={{ padding: '2px 8px', fontSize: '10px' }}>Low Stock Warning</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Safety Stock Threshold: {formData.minStock} {formData.secondaryUnit}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductView;
