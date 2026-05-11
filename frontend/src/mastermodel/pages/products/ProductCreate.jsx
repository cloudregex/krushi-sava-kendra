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
    company: '', unit: '', unitValue: 1, multiUnits: [],
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
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase' }}>Primary Value</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ padding: '8px 12px', fontSize: '14px' }}
                    value={formData.unitValue}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      unitValue: e.target.value,
                      multiUnits: [] // Reset conversions when primary value changes
                    }))}
                    placeholder="e.g. 50"
                  />
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', marginLeft: '2px' }}>
                    Value cannot be changed once set.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <SearchableSelect
                    label="Primary Unit"
                    options={units}
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      unit: e.target.value,
                      multiUnits: [] // Reset conversions when primary unit changes
                    }))}
                    required
                    placeholder="Select Primary Unit"
                  />
                  <p style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', marginLeft: '2px' }}>
                    Primary Unit cannot be changed once set.
                  </p>
                </div>
              </div>

              <div className="agro-grid-2">
                <SearchableSelect label="Tax" options={taxes} value={formData.tax} onChange={(e) => setFormData(prev => ({ ...prev, tax: e.target.value }))} required placeholder="Select Tax %" />
                <FormField label="Company" name="company" value={formData.company} onChange={handleChange} placeholder="e.g. ABC Ltd" />
              </div>
            </div>

            {/* Multi-Unit Management Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '15px', borderTop: '1px dashed var(--border-light)' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', color: 'var(--primary)' }}>
                <Layers size={14} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Unit Management</h3>
              </div>

              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '1px solid var(--border-light)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <table className="agro-table" style={{ width: '100%', background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                      <th style={{ textAlign: 'left' }}>VALUE</th>
                      <th style={{ textAlign: 'left' }}>UNIT</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: 'center', fontWeight: '700', color: 'var(--text-muted)' }}>1</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          style={{ padding: '8px 12px', fontSize: '14px' }}
                          value={tempUnit.conversion}
                          onChange={(e) => setTempUnit(prev => ({ ...prev, conversion: e.target.value }))}
                          placeholder="e.g. 50"
                        />
                      </td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '8px 12px', fontSize: '14px' }}
                          value={tempUnit.alternative}
                          onChange={(e) => setTempUnit(prev => ({ ...prev, alternative: e.target.value }))}
                        >
                          <option value="">- Select Unit -</option>
                          {units
                            .filter(u => u !== formData.unit && !formData.multiUnits.find(mu => mu.alternative === u))
                            .map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        {tempUnit.alternative && tempUnit.conversion && (
                          <div style={{ fontSize: '10px', color: 'var(--primary)', marginTop: '4px', fontWeight: '600' }}>
                            Preview: {tempUnit.conversion} {tempUnit.alternative} = {formData.unitValue} {formData.unit}
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-agro btn-primary"
                          style={{ height: '38px', padding: '0 15px', borderRadius: '8px' }}
                          onClick={() => {
                            const inputVal = parseFloat(tempUnit.conversion);
                            if (tempUnit.alternative && formData.unit && inputVal > 0) {
                              const primaryVal = parseFloat(formData.unitValue) || 1;
                              const actualConversionFactor = primaryVal / inputVal;

                              const newUnit = {
                                ...tempUnit,
                                primary: formData.unit,
                                multiplier: 1,
                                productName: `${inputVal} ${tempUnit.alternative} = ${primaryVal} ${formData.unit}`,
                                tax: formData.tax || '0',
                                amount: '0',
                                conversion: actualConversionFactor,
                                displayValue: inputVal // Store for display
                              };
                              setFormData(prev => ({
                                ...prev,
                                multiUnits: [...prev.multiUnits, newUnit]
                              }));
                              setTempUnit({ productName: '', primary: '', alternative: '', tax: '', amount: '', conversion: '' });
                            } else if (!formData.unit) {
                              toast.error("Please select a Primary Unit first");
                            } else if (!inputVal || inputVal <= 0) {
                              toast.error("Please enter a valid Value");
                            } else {
                              toast.error("Please select a Unit");
                            }
                          }}
                        >
                          Add
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {formData.multiUnits.length > 0 && (
                  <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Defined Conversions</div>
                    <table className="agro-table" style={{ width: '100%', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          <th>Unit Name</th>
                          <th>Conversion Logic</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.multiUnits.map((u, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '600' }}>{u.alternative}</td>
                            <td>{u.productName}</td>
                            <td style={{ textAlign: 'right' }}>
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
