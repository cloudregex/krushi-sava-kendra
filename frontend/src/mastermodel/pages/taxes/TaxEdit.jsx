import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Percent } from 'lucide-react';
import { MockService } from '../../services/MockService';
import FormField from '../../components/FormField';
import '../../styles/MasterModel.css';

const TaxEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', rate: '', isActive: true });

  useEffect(() => {
    const fetchItem = async () => {
      const item = await MockService.getById('taxes', id);
      if (item) {
        setFormData(item);
      } else {
        alert('Tax not found');
        navigate('/taxes');
      }
      setLoading(false);
    };
    fetchItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    await MockService.update('taxes', Number(id), formData);
    navigate('/taxes');
  };

  if (loading) return <div className="agro-container">Loading...</div>;

  return (
    <div className="agro-container">
      <form onSubmit={handleFinalSave} className="agro-unified-card">
        <div className="agro-header-compact" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Update Tax Configuration</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Configure GST and other tax rates</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/taxes')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

          <div style={{ padding: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-section-title" style={{ marginBottom: '10px' }}>
                <Percent size={18} />
                <h3 style={{ fontSize: '14px', margin: 0 }}>Tax Details</h3>
              </div>
              
              <FormField label="Tax Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. GST" />
              <FormField label="Rate (%)" name="rate" type="number" value={formData.rate} onChange={handleChange} required placeholder="e.g. 18" />
            </div>
          </div>

          <div style={{ 
            padding: '25px 40px', 
            background: '#f9fafb', 
            borderTop: '1px solid var(--border-light)', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '15px' 
          }}>
            <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/taxes')} style={{ minWidth: '120px' }}>
              <X size={18} /> Cancel
            </button>
            <button type="submit" className="btn-agro btn-primary" style={{ minWidth: '180px' }}>
              <Save size={18} /> Update Tax
            </button>
          </div>
      </form>
    </div>
  );
};

export default TaxEdit;
