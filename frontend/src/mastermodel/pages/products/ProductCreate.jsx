import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Save, X, Tag, DollarSign, Package, Layers, Calendar } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import { toast } from 'react-hot-toast';
import FormField from '../../components/FormField';
import SearchableSelect from '../../components/SearchableSelect';
import '../../styles/MasterModel.css';
import { getMarathiTranslation } from '../../utils/TranslationHelper';

const ProductCreate = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);

  const [formData, setFormData] = useState({
    name: '', marathiName: '', hsnCode: '', category: '', tax: '',
    company: '',
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

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    // Immediate state update for the field being typed
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-translate logic (Asynchronous for accuracy)
    if (name === 'name') {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setFormData(prev => ({ ...prev, marathiName: '' }));
      } else {
        try {
          const translation = await getMarathiTranslationAsync(value);
          if (translation) {
            setFormData(prev => ({ ...prev, marathiName: translation }));
          }
        } catch (error) {
          // Fallback to local translation if API fails
          const localTranslation = getMarathiTranslation(value);
          setFormData(prev => ({ ...prev, marathiName: localTranslation }));
        }
      }
    }
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    try {
      // Sanitize numeric fields
      const sanitizedData = {
        ...formData,
        minStock: formData.minStock === '' ? 0 : Number(formData.minStock),
        currentStock: formData.currentStock === '' ? 0 : Number(formData.currentStock)
      };
      
      console.log("Sending product data to save:", sanitizedData);
      await ApiService.save('products', sanitizedData);
      toast.success("Product registered successfully!");
      navigate('/products');
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to save product. Please check all fields.";
      toast.error(errorMsg);
      console.error("Error saving product:", error);
    }
  };

  const getMarathiTranslationAsync = async (text) => {
    return getMarathiTranslation(text);
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

              <div className="agro-grid-2">
                <FormField label="Product Name (English)" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Urea" />
                <FormField label="उत्पादनाचे नाव (मराठी)" name="marathiName" value={formData.marathiName} onChange={handleChange} placeholder="उदा. युरिया" />
              </div>

              <div className="agro-grid-2">
                <FormField label="HSN Code" name="hsnCode" value={formData.hsnCode} onChange={handleChange} required placeholder="e.g. 3101" />
                <SearchableSelect label="Category" options={categories} value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} required />
              </div>

              <div className="agro-grid-2">
                <SearchableSelect label="Tax" options={taxes} value={formData.tax} onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))} required placeholder="Select Tax %" />
                <FormField label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. ABC Ltd" />
              </div>


            </div>

            {/* Stock & Alerts Section - Now below units */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', color: 'var(--primary)' }}>
                <Package size={14} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Stock & Alerts</h3>
              </div>

              <div className="agro-grid-2">
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

        <div className="agro-form-footer">
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/products')}>
            <X size={16} /> Cancel
          </button>
          <button type="submit" className="btn-agro btn-primary">
            <Save size={16} /> Save Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
