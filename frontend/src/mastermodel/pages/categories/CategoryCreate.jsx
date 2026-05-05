import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, Layers } from 'lucide-react';
import { useCRUD } from '../../hooks/useCRUD';
import FormField from '../../components/FormField';
import '../../styles/MasterModel.css';

const CategoryCreate = () => {
  const navigate = useNavigate();
  const { handleSave } = useCRUD('categories');
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    await handleSave(formData);
    navigate('/categories');
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Create New Category</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Define product groupings</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/categories')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', color: 'var(--primary)' }}>
              <Layers size={16} />
              <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Category Details</h3>
            </div>

            <FormField label="Category Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Fertilizers" />
            <FormField label="Description" name="description" type="textarea" value={formData.description} onChange={handleChange} placeholder="Category description..." />
          </div>
        </div>

        <div style={{
          padding: '10px 20px',
          background: '#f8fafc',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/categories')} style={{ height: '36px', minWidth: '100px', fontSize: '13px' }}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary" style={{ height: '36px', minWidth: '140px', fontSize: '13px' }}>
            <Save size={16} /> Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryCreate;
