import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Save, X, Tag, DollarSign, Package, Layers, Calendar, Trash2 } from 'lucide-react';
import { ApiService } from '../../services/ApiService';
import FormField from '../../components/FormField';
import SearchableSelect from '../../components/SearchableSelect';
import '../../styles/MasterModel.css';
import { getMarathiTranslation } from '../../utils/TranslationHelper';
import toast from 'react-hot-toast';

const ProductCreate = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [units, setUnits] = useState([]);

  const [formData, setFormData] = useState({
    name: '', marathiName: '', hsnCode: '', category: '', tax: '',
    company: '', unit: '', multiUnits: [],
    minStock: '', currentStock: '',
    expiryRequired: false, isActive: true
  });

  const [tempUnit, setTempUnit] = useState({ productName: '', primary: '', alternative: '', tax: '', amount: '', conversion: '' });

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [catData, taxData, unitData] = await Promise.all([
          ApiService.getAll('categories'),
          ApiService.getAll('taxes'),
          ApiService.getAll('units')
        ]);
        setCategories(catData.filter(c => c.isActive).map(c => c.name));
        setTaxes(taxData.filter(t => t.isActive).map(t => t.rate.toString()));
        setUnits(unitData.filter(u => u.isActive).map(u => u.name));
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

    if (name === 'name' && value.trim()) {
      const translation = getMarathiTranslation(value);
      setFormData(prev => ({ ...prev, marathiName: translation }));
    }
  };

  const handleFinalSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        minStock: formData.minStock === '' ? 0 : parseFloat(formData.minStock),
        currentStock: formData.currentStock === '' ? 0 : parseFloat(formData.currentStock)
      };
      console.log("Submitting Product Data:", payload);
      await ApiService.save('products', payload);
      toast.success("Product saved successfully!");
      navigate('/products');
    } catch (error) {
      console.error("Save Error:", error);
      const serverMsg = error.response?.data?.message;
      const finalMsg = Array.isArray(serverMsg) ? serverMsg.join(', ') : (serverMsg || "Failed to save product. Please check all fields.");
      toast.error(finalMsg);
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
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <SearchableSelect 
                    label="Unit" 
                    options={units} 
                    value={formData.unit} 
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))} 
                    required 
                    placeholder="Select Unit" 
                  />
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', marginLeft: '2px' }}>
                    Unit cannot be changed once set
                  </p>
                </div>
                <SearchableSelect label="Tax" options={taxes} value={formData.tax} onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))} required placeholder="Select Tax %" />
              </div>

              <div className="agro-grid-2">
                <div style={{ gridColumn: 'span 2' }}>
                  <FormField label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. ABC Ltd" />
                </div>
              </div>
            </div>

            {/* Multi-Unit Management Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '15px', borderTop: '1px dashed var(--border-light)' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: 'var(--primary)' }}>
                <Layers size={14} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Unit Management</h3>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 100px 100px 80px auto', gap: '10px', alignItems: 'end' }}>
                  <FormField label="Product Name" value={tempUnit.productName} onChange={(e) => setTempUnit(prev => ({ ...prev, productName: e.target.value }))} placeholder="e.g. Bag, Box" />
                  <SearchableSelect label="Primary Unit" options={units} value={tempUnit.primary} onChange={(e) => setTempUnit(prev => ({ ...prev, primary: e.target.value }))} placeholder="Select" />
                  <SearchableSelect label="Alt Unit" options={units} value={tempUnit.alternative} onChange={(e) => setTempUnit(prev => ({ ...prev, alternative: e.target.value }))} placeholder="Select" />
                  <SearchableSelect label="Tax" options={taxes} value={tempUnit.tax} onChange={(e) => setTempUnit(prev => ({ ...prev, tax: e.target.value }))} placeholder="Tax %" />
                  <FormField label="Amount" type="number" value={tempUnit.amount} onChange={(e) => setTempUnit(prev => ({ ...prev, amount: e.target.value }))} placeholder="Price" />
                  <FormField label="Qty" type="number" value={tempUnit.conversion} onChange={(e) => setTempUnit(prev => ({ ...prev, conversion: e.target.value }))} placeholder="Qty" />
                  <button 
                    type="button" 
                    className="btn-agro btn-primary" 
                    style={{ height: '42px', padding: '0 15px', borderRadius: '10px', marginBottom: '8px' }}
                    onClick={() => {
                      if (tempUnit.primary && tempUnit.alternative && tempUnit.conversion) {
                        setFormData(prev => ({
                          ...prev,
                          multiUnits: [...prev.multiUnits, { ...tempUnit }]
                        }));
                        setTempUnit({ productName: '', primary: '', alternative: '', tax: '', amount: '', conversion: '' });
                      } else {
                        toast.error("Please fill required fields (Units & Qty)");
                      }
                    }}
                  >
                    Add
                  </button>
                </div>

                {formData.multiUnits.length > 0 && (
                  <div style={{ marginTop: '15px', overflowX: 'auto' }}>
                    <table className="agro-table" style={{ width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th>Primary Unit</th>
                          <th>Alt Unit</th>
                          <th>Conversion</th>
                          <th>Amount</th>
                          <th>Tax</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.multiUnits.map((u, idx) => (
                          <tr key={idx}>
                            <td>{u.productName}</td>
                            <td>{u.primary}</td>
                            <td>{u.alternative}</td>
                            <td>1 {u.alternative} = {u.conversion} {u.primary}</td>
                            <td>₹{u.amount}</td>
                            <td>{u.tax}%</td>
                            <td>
                              <button type="button" className="action-btn btn-delete" onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  multiUnits: prev.multiUnits.filter((_, i) => i !== idx)
                                }));
                              }}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Stock & Alerts Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px dashed var(--border-light)' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', color: 'var(--primary)' }}>
                <Package size={14} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Stock & Alerts</h3>
              </div>

              <div className="agro-grid-2">
                <FormField label="Current Stock" name="currentStock" type="number" value={formData.currentStock} onChange={handleChange} required placeholder="0" />
                <FormField label="Low Stock Alert" name="minStock" type="number" value={formData.minStock} onChange={handleChange} required placeholder="5" />
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
