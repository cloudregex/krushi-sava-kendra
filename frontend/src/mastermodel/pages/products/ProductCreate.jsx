import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Save, X, Tag, DollarSign, Package, Layers, Calendar } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import FormField from '../../components/FormField';
import SearchableSelect from '../../components/SearchableSelect';
import '../../styles/MasterModel.css';

const ProductCreate = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const [formData, setFormData] = useState({
    name: '', code: '', category: '', tax: '',
    company: '', primaryUnit: '', secondaryUnit: '', conversionFactor: '',
    minStock: '', currentStock: '',
    expiryRequired: false, isActive: true
  });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catData, taxData] = await Promise.all([
          ApiService.getAll('categories'),
          ApiService.getAll('taxes')
        ]);
        setCategories(catData.filter(c => c.isActive).map(c => c.name));
        setTaxes(taxData.filter(t => t.isActive).map(t => t.rate.toString()));
      } catch (error) {
        console.error("Master data fetch failed", error);
      }
    };
    fetchMasterData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    await ApiService.save('products', formData);
    navigate('/products');
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>Register New Product</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Manage stocks, pricing and categories</p>
          </div>
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/products')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Basic Info Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', color: 'var(--primary)' }}>
                <Tag size={14} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Basic Information</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '5px' }}>
                <FormField label="Product Name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter product name" />
                <FormField label="Product Code" name="code" value={formData.code} onChange={handleChange} required placeholder="e.g. PRD001" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <SearchableSelect label="Category" options={categories} value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} required />
                <SearchableSelect label="Tax" options={taxes} value={formData.tax} onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))} required placeholder="Select Tax %" />
              </div>

              <FormField label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. ABC Ltd" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <SearchableSelect label="Purchase Unit" options={['Box', 'Bag', 'Case', 'Crate', 'Drum', 'Nos']} value={formData.primaryUnit} onChange={(e) => setFormData(prev => ({ ...prev, primaryUnit: e.target.value }))} required />
                <SearchableSelect label="Sale Unit" options={['Nos', 'Kg', 'Ltr', 'Pcs', 'Gm', 'Ml', 'Packet']} value={formData.secondaryUnit} onChange={(e) => setFormData(prev => ({ ...prev, secondaryUnit: e.target.value }))} required />
                <FormField
                  label="Conversion Factor"
                  name="conversionFactor"
                  type="number"
                  value={formData.conversionFactor}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10"
                  hint={(formData.primaryUnit && formData.secondaryUnit) ? `1 ${formData.primaryUnit} = ${formData.conversionFactor || '?'} ${formData.secondaryUnit}` : ""}
                />
              </div>
            </div>

            {/* Stock & Alerts Section - Now below units */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', color: 'var(--primary)' }}>
                <Package size={14} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Stock & Alerts</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <FormField label="Current Stock" name="currentStock" type="number" value={formData.currentStock} onChange={handleChange} required placeholder="0" />
                <FormField 
                  label="Low Stock Alert" 
                  name="minStock" 
                  type="number" 
                  value={formData.minStock} 
                  onChange={handleChange} 
                  required 
                  placeholder="5" 
                  hint={formData.currentStock !== "" && formData.minStock !== "" ? (Number(formData.currentStock) < Number(formData.minStock) ? `Low by ${Number(formData.minStock) - Number(formData.currentStock)}` : "Stock Sufficient") : ""}
                  hintColor={formData.currentStock !== "" && formData.minStock !== "" ? (Number(formData.currentStock) < Number(formData.minStock) ? "#ef4444" : "#16a34a") : ""}
                />
              </div>


            </div>
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
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/products')} style={{ height: '36px', minWidth: '100px', fontSize: '13px' }}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary" style={{ height: '36px', minWidth: '140px', fontSize: '13px' }}>
            <Save size={16} /> Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
