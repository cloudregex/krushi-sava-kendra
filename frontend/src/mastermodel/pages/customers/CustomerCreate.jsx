import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X, User, MapPin } from 'lucide-react';
import { useCRUD } from '../../hooks/useCRUD';
import FormField from '../../components/FormField';
import toast from 'react-hot-toast';
import '../../styles/MasterModel.css';

const CustomerCreate = () => {
  const navigate = useNavigate();
  const { handleSave } = useCRUD('customers');
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', address: '',
    gstNo: '', isActive: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Restrict mobile to digits only and 10 chars max
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    
    // Validate mobile number
    if (formData.mobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }
    
    // Sanitize data: convert empty strings for optional fields to null
    const sanitizedData = {
      ...formData,
      email: formData.email.trim() === '' ? null : formData.email.trim(),
      gstNo: formData.gstNo.trim() === '' ? null : formData.gstNo.trim(),
      mobile: formData.mobile.trim()
    };

    try {
      await handleSave(sanitizedData);
      navigate('/customers');
    } catch (error) {
      // Error handling is managed by useCRUD/ApiService toast
      console.error("Save error:", error);
    }
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>New Customer Registration</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Register a new farmer or customer record</p>
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
            <Save size={16} /> Save Customer
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerCreate;
