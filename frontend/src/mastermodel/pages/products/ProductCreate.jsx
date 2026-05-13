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
    company: '', unit: '', unitValue: 1, minStock: '', currentStock: '',
    expiryRequired: false, isActive: true
  });

  const [unitRows, setUnitRows] = useState([{ id: 'primary-row', value: 1, unit: '' }]);
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
      if (!formData.unit) {
        toast.error("Please select a Primary Unit");
        return;
      }

      const multiUnits = unitRows
        .filter(r => r.unit && r.value)
        .map(r => {
          const conversionFactor = parseFloat(formData.unitValue) / parseFloat(r.value);
          return {
            alternative: r.unit,
            conversion: conversionFactor,
            productName: `${r.value} ${r.unit} = ${formData.unitValue} ${formData.unit}`,
            tax: formData.tax || '0',
            amount: '0'
          };
        });

      const payload = {
        ...formData,
        unitValue: parseFloat(formData.unitValue),
        multiUnits: multiUnits,
        minStock: formData.minStock === '' ? 0 : parseFloat(formData.minStock),
        currentStock: formData.currentStock === '' ? 0 : parseFloat(formData.currentStock)
      };
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

  const addUnitRow = () => {
    setUnitRows([...unitRows, { id: Date.now(), value: 1, unit: '' }]);
  };

  const removeUnitRow = (id) => {
    setUnitRows(unitRows.filter(r => r.id !== id));
  };

  const handleUnitRowChange = (id, field, value) => {
    setUnitRows(unitRows.map(row => {
      if (row.id === id) {
        // If the primary row in table is changed, sync it back to formData
        if (id === 'primary-row') {
          if (field === 'value') setFormData(prev => ({ ...prev, unitValue: value }));
          if (field === 'unit') setFormData(prev => ({ ...prev, unit: value }));
        }
        return { ...row, [field]: value };
      }
      return row;
    }));
  };

  const handlePrimaryChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setUnitRows(prevRows => {
      const newRows = [...prevRows];
      if (newRows.length > 0) {
        newRows[0] = { ...newRows[0], [field === 'unitValue' ? 'value' : 'unit']: value };
      }
      return newRows;
    });
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
          <button type="button" className="btn-agro btn-outline" onClick={() => navigate('/products')}>
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
                <FormField label="Product Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Urea" />
                <FormField label="उत्पादनाचे नाव" name="marathiName" value={formData.marathiName} onChange={handleChange} placeholder="उदा. युरिया" />
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

            {/* Stock & Alerts Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px dashed var(--border-light)', marginTop: '-6px' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0', color: 'var(--primary)', paddingTop: '4px' }}>
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

            <div className="agro-grid-2" style={{ marginTop: '5px' }}>
              <FormField
                label="Primary Value"
                name="unitValue"
                type="number"
                value={formData.unitValue}
                onChange={(e) => handlePrimaryChange('unitValue', e.target.value)}
                placeholder="e.g. 50"
              />
              <SearchableSelect
                label="Primary Unit"
                options={units}
                value={formData.unit}
                onChange={(e) => handlePrimaryChange('unit', e.target.value)}
                required
                placeholder="Select Primary Unit"
                hint="Primary Unit cannot be changed once set."
                hintColor="#ef4444"
              />
            </div>

            {/* Unit Management Section - Table Based UI */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '2px', borderTop: '1px dashed var(--border-light)', marginTop: '-12px' }}>
              <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '0px', color: 'var(--primary)' }}>
                <Layers size={14} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Add Unit</h3>
              </div>

              <div style={{ background: 'white', padding: '0', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <table className="agro-table" style={{ width: '100%', fontSize: '12px', margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>#</th>
                      <th style={{ textAlign: 'left' }}>VALUE</th>
                      <th style={{ textAlign: 'left' }}>UNIT</th>
                      <th style={{ width: '100px', textAlign: 'center' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitRows.map((row, index) => (
                      <tr key={row.id}>
                        <td style={{ textAlign: 'center' }}>{index + 1}</td>
                        <td>
                          <FormField
                            noLabel
                            noMargin
                            type="number"
                            value={row.value}
                            onChange={(e) => handleUnitRowChange(row.id, 'value', e.target.value)}
                            placeholder="Value"
                          />
                        </td>
                        <td>
                          <FormField
                            noLabel
                            noMargin
                            type="select"
                            value={row.unit}
                            onChange={(e) => handleUnitRowChange(row.id, 'unit', e.target.value)}
                            options={units.filter(u => {
                              if (index === 0 && u === formData.unit) return true;
                              if (index !== 0 && u === formData.unit) return false;
                              const isSelectedElsewhere = unitRows.some((r, i) => i !== index && r.unit === u);
                              return !isSelectedElsewhere;
                            })}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-agro"
                            style={{ 
                                background: '#f43f5e', 
                                color: 'white', 
                                border: 'none', 
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                margin: '0 auto',
                                opacity: index === 0 ? 0.4 : 1,
                                cursor: index === 0 ? 'not-allowed' : 'pointer'
                              }}
                              onClick={() => index !== 0 && removeUnitRow(row.id)}
                              disabled={index === 0}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn-agro btn-primary"
                  onClick={addUnitRow}
                >
                  <Plus size={14} /> Add Unit
                </button>
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
