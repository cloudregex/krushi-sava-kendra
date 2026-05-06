import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Percent } from 'lucide-react';
import { useCRUD } from '../../hooks/useCRUD';
import FormField from '../../components/FormField';
import '../../styles/MasterModel.css';

const TaxCreate = () => {
  const navigate = useNavigate();
  const { handleSave } = useCRUD('taxes');
  const [formData, setFormData] = useState({ name: '', rate: '', isActive: true });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    await handleSave(formData);
    navigate('/taxes');
  };

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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Register New Tax Rate</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Configure GST and other tax rates</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/taxes')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0', color: 'var(--primary)' }}>
              <Percent size={16} />
              <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Tax Details</h3>
            </div>
            
            <FormField label="Tax Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. GST" />
            <FormField label="Rate (%)" name="rate" type="number" value={formData.rate} onChange={handleChange} required placeholder="e.g. 18" />
          </div>
        </div>

        <div className="agro-form-footer">
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/taxes')}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary">
            <Save size={16} /> Save Tax
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaxCreate;
