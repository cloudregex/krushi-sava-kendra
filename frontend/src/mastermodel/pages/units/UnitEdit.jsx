import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Tag } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import FormField from '../../components/FormField';
import SearchableSelect from '../../components/SearchableSelect';
import '../../styles/MasterModel.css';

const UnitEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const unitOptions = [
    'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Pieces', 'Box', 'Bag', 'Packet', 'Bottle', 'Tin', 'Drum', 'Set', 'Dozen', 'Roll'
  ];
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    isActive: true
  });

  useEffect(() => {
    const fetchItem = async () => {
      const item = await ApiService.getById('units', id);
      if (item) {
        setFormData(item);
      } else {
        alert('Unit not found');
        navigate('/units');
      }
      setLoading(false);
    };
    fetchItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    await ApiService.update('units', Number(id), formData);
    navigate('/units');
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Edit Unit</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Update unit details</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/units')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px' }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', color: 'var(--primary)' }}>
              <Tag size={14} />
              <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Unit Details</h3>
            </div>
            
            <SearchableSelect
              label="Unit Name"
              options={unitOptions}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              placeholder="Select or Search Unit"
              limitInitial={4}
            />


          </div>
        </div>

        <div className="agro-form-footer">
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/units')}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary">
            <Save size={16} /> Update Unit
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnitEdit;
