import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, User, MapPin } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import FormField from '../../components/FormField';
import '../../styles/MasterModel.css';

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', address: '',
    gstNo: '', isActive: true
  });

  useEffect(() => {
    const fetchItem = async () => {
      const item = await ApiService.getById('customers', id);
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    await ApiService.update('customers', Number(id), formData);
    navigate('/customers');
  };

  if (loading) return <div className="agro-container">Loading...</div>;

  return (
    <div className="agro-container" style={{ padding: '25px 25px 0 25px' }}>
      <form onSubmit={handleFinalSave} className="agro-unified-card" style={{
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Update Customer Profile</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Update details for the selected customer record</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/customers')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0', color: 'var(--primary)' }}>
              <User size={16} />
              <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Customer Information</h3>
            </div>

            <FormField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter customer name" />

            <div className="agro-grid-2">
              <FormField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="10 digit number" />
              <FormField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Optional" />
            </div>

            <FormField label="GST Number" name="gstNo" value={formData.gstNo} onChange={handleChange} placeholder="Optional GSTIN" />

            <div style={{ marginTop: '5px' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0', color: 'var(--primary)' }}>
                <MapPin size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Address Details</h3>
              </div>
              <FormField label="Full Address" name="address" type="textarea" value={formData.address} onChange={handleChange} required placeholder="Enter detailed address" />
            </div>
          </div>
        </div>

        <div className="agro-form-footer">
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/customers')}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary">
            <Save size={16} /> Update Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerEdit;
