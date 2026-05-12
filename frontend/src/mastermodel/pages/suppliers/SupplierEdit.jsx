import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, User } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import FormField from '../../components/FormField';
import toast from 'react-hot-toast';
import '../../styles/MasterModel.css';

const SupplierEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '', mobile: '', altMobileNo: '', email: '',
    address: '', gstNo: '', isActive: true
  });

  useEffect(() => {
    const fetchItem = async () => {
      const item = await ApiService.getById('suppliers', id);
      if (item) {
        setFormData(item);
      } else {
        alert('Supplier not found');
        navigate('/suppliers');
      }
      setLoading(false);
    };
    fetchItem();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Restrict mobile to digits only and 10 chars max
    if (name === 'mobile' || name === 'altMobileNo') {
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

    // Validate primary mobile
    if (formData.mobile.length !== 10) {
      toast.error("Primary mobile number must be exactly 10 digits");
      return;
    }

    // Validate alt mobile if provided
    if (formData.altMobileNo && formData.altMobileNo.length > 0 && formData.altMobileNo.length !== 10) {
      toast.error("Alternative mobile number must be 10 digits");
      return;
    }

    // Sanitize data: convert empty strings for optional fields to null
    const sanitizedData = {
      ...formData,
      email: formData.email?.trim() === '' ? null : formData.email?.trim(),
      gstNo: formData.gstNo?.trim() === '' ? null : formData.gstNo?.trim(),
      altMobileNo: formData.altMobileNo?.trim() === '' ? null : formData.altMobileNo?.trim(),
      mobile: formData.mobile?.trim()
    };

    try {
      await ApiService.update('suppliers', Number(id), sanitizedData);
      navigate('/suppliers');
    } catch (error) {
      console.error("Update error:", error);
    }
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Edit Supplier Profile</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Update details for your vendor or product supplier</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/suppliers')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0', color: 'var(--primary)' }}>
              <User size={16} />
              <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Business Information</h3>
            </div>

            <FormField label="Supplier Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter supplier name" />

            <div className="agro-grid-2">
              <FormField label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="Primary mobile" />
              <FormField label="Alt Mobile No (Optional)" name="altMobileNo" value={formData.altMobileNo} onChange={handleChange} placeholder="Alternative number" />
            </div>

            <FormField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="supplier@example.com" />
            <FormField label="GST Number" name="gstNo" value={formData.gstNo} onChange={handleChange} placeholder="15-digit GSTIN" />

            <FormField label="Full Business Address" name="address" type="textarea" value={formData.address} onChange={handleChange} required placeholder="Enter complete business address" />
          </div>
        </div>

        <div className="agro-form-footer">
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/suppliers')}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary">
            <Save size={16} /> Update Supplier
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierEdit;
