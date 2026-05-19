import React, { useState, useEffect } from 'react';
import { X, Save, User, MapPin, Tag, Package, Layers, Plus, Trash2 } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import { getMarathiTranslationAsync } from '../mastermodel/utils/TranslationHelper';
import toast from 'react-hot-toast';

export const QuickCustomerModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', address: '', gstNo: '', isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', mobile: '', email: '', address: '', gstNo: '', isActive: true });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const numeric = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, mobile: numeric }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Full Name is required");
    if (formData.mobile.length !== 10) return toast.error("Mobile number must be exactly 10 digits");
    if (!formData.address.trim()) return toast.error("Address is required");

    setSaving(true);
    const sanitized = {
      ...formData,
      email: formData.email.trim() === '' ? null : formData.email.trim(),
      gstNo: formData.gstNo.trim() === '' ? null : formData.gstNo.trim(),
      mobile: formData.mobile.trim(),
      isActive: true
    };

    try {
      const saved = await ApiService.add('customers', sanitized);
      toast.success("Customer Registered Successfully!");
      if (onSave) onSave(saved.data || saved);
      onClose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to save customer";
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999,
      padding: '20px', transition: 'all 0.3s ease'
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: '650px', borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        border: '1px solid rgba(226, 232, 240, 0.8)', animation: 'modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#ffffff'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Quick Customer Registration</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Register a new farmer or customer record instantly</p>
          </div>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary, #ef4444)', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                <User size={16} />
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer Information</span>
              </div>

              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="Enter customer name"
                  style={{
                    height: '40px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                    border: '1px solid #cbd5e1', outline: 'none', transition: 'border-color 0.2s'
                  }}
                />
              </div>

              {/* Mobile and Email Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text" name="mobile" value={formData.mobile} onChange={handleChange} required
                    placeholder="10 digit number"
                    style={{
                      height: '40px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Email Address</label>
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="Optional email"
                    style={{
                      height: '40px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* GST No */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>GST Number</label>
                <input
                  type="text" name="gstNo" value={formData.gstNo} onChange={handleChange}
                  placeholder="Optional GSTIN"
                  style={{
                    height: '40px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                    border: '1px solid #cbd5e1', outline: 'none'
                  }}
                />
              </div>

              {/* Address Details Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary, #ef4444)', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px', marginTop: '5px' }}>
                <MapPin size={16} />
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address Details</span>
              </div>

              {/* Full Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Full Address <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea
                  name="address" value={formData.address} onChange={handleChange} required
                  placeholder="Enter detailed address" rows="3"
                  style={{
                    padding: '10px 12px', fontSize: '13px', borderRadius: '8px',
                    border: '1px solid #cbd5e1', outline: 'none', resize: 'none'
                  }}
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px',
            padding: '15px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc'
          }}>
            <button type="button" onClick={onClose} style={{
              height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', color: '#64748b',
              background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{
              height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', color: '#ffffff',
              background: 'var(--primary, #ef4444)', border: 'none', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1
            }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const QuickProductModal = ({ isOpen, onClose, onSave }) => {
  const [categories, setCategories] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState({
    name: '', marathiName: '', hsnCode: '', category: '', tax: '',
    barcode: '', unit: '', unitValue: 1, minStock: '5', currentStock: '0',
    expiryRequired: false, isActive: true
  });
  const [unitRows, setUnitRows] = useState([{ id: 'primary-row', value: 1, unit: '', amount: '' }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch Master Lists dynamically
      Promise.all([
        ApiService.getAll('categories'),
        ApiService.getAll('taxes'),
        ApiService.getAll('units')
      ]).then(([catData, taxData, unitData]) => {
        setCategories(catData.filter(c => c.isActive).map(c => c.name));
        setTaxes(taxData.filter(t => t.isActive).map(t => t.rate.toString()));
        setUnits(unitData.filter(u => u.isActive).map(u => u.name));
      }).catch(err => {
        console.error("Quick Product Modal Master lists fetch failed:", err);
      });

      // Reset states
      setFormData({
        name: '', marathiName: '', hsnCode: '', category: '', tax: '',
        barcode: '', unit: '', unitValue: 1, minStock: '5', currentStock: '0',
        expiryRequired: false, isActive: true
      });
      setUnitRows([{ id: 'primary-row', value: 1, unit: '', amount: '' }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name' && value.trim()) {
      try {
        const trans = await getMarathiTranslationAsync(value);
        setFormData(prev => ({ ...prev, marathiName: trans }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handlePrimaryChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    setUnitRows(prevRows => {
      const copy = [...prevRows];
      if (copy.length > 0) {
        copy[0] = { ...copy[0], [field === 'unitValue' ? 'value' : 'unit']: val };
      }
      return copy;
    });
  };

  const handleUnitRowChange = (id, field, val) => {
    setUnitRows(prev => prev.map(row => {
      if (row.id === id) {
        if (id === 'primary-row') {
          if (field === 'value') setFormData(prevF => ({ ...prevF, unitValue: val }));
          if (field === 'unit') setFormData(prevF => ({ ...prevF, unit: val }));
        }
        return { ...row, [field]: val };
      }
      return row;
    }));
  };

  const addUnitRow = () => {
    setUnitRows(prev => [...prev, { id: Date.now(), value: 1, unit: '', amount: '' }]);
  };

  const removeUnitRow = (id) => {
    setUnitRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Product Name is required");
    if (!formData.hsnCode.trim()) return toast.error("HSN Code is required");
    if (!formData.category) return toast.error("Please select a Category");
    if (!formData.tax) return toast.error("Please select Tax %");
    if (!formData.unit) return toast.error("Please select Primary Unit");

    setSaving(true);

    const multiUnits = unitRows
      .filter(r => r.unit && r.value)
      .map(r => {
        const conversionFactor = parseFloat(formData.unitValue) / parseFloat(r.value);
        return {
          alternative: r.unit,
          conversion: conversionFactor,
          productName: `${r.value} ${r.unit} = ${formData.unitValue} ${formData.unit}`,
          tax: formData.tax || '0',
          amount: r.amount || '0'
        };
      });

    const payload = {
      ...formData,
      unitValue: parseFloat(formData.unitValue),
      multiUnits,
      minStock: formData.minStock === '' ? 0 : parseFloat(formData.minStock),
      currentStock: formData.currentStock === '' ? 0 : parseFloat(formData.currentStock),
      isActive: true
    };

    try {
      const saved = await ApiService.save('products', payload);
      toast.success("Product Registered Successfully!");
      if (onSave) onSave(saved.data || saved);
      onClose();
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to save product";
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999,
      padding: '20px', transition: 'all 0.3s ease'
    }}>
      <div style={{
        background: '#ffffff', width: '100%', maxWidth: '750px', borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        border: '1px solid rgba(226, 232, 240, 0.8)', animation: 'modalScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#ffffff'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Register New Product</h3>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>Manage stocks, pricing and categories instantly</p>
          </div>
          <button onClick={onClose} style={{
            background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary, #ef4444)', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px' }}>
                <Tag size={16} />
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Basic Information</span>
              </div>

              {/* Name & Marathi Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Product Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    placeholder="e.g. Urea"
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>उत्पादनाचे नाव</label>
                  <input
                    type="text" name="marathiName" value={formData.marathiName} onChange={handleChange}
                    placeholder="उदा. युरिया"
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* HSN & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>HSN Code <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="text" name="hsnCode" value={formData.hsnCode} onChange={handleChange} required
                    placeholder="e.g. 3101"
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="category" value={formData.category} onChange={handleChange} required
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none', background: 'white'
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Tax & Barcode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tax % <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="tax" value={formData.tax} onChange={handleChange} required
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none', background: 'white'
                    }}
                  >
                    <option value="">Select Tax %</option>
                    {taxes.map(t => <option key={t} value={t}>{t}%</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Barcode</label>
                  <input
                    type="text" name="barcode" value={formData.barcode} onChange={handleChange}
                    placeholder="e.g. 123456789012"
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary, #ef4444)', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px', marginTop: '5px' }}>
                <Package size={16} />
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock & Alerts</span>
              </div>

              {/* Current Stock & Alerts */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Current Stock <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} required
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Low Stock Alert <span style={{ color: '#ef4444' }}>*</span></label>
                  <input
                    type="number" name="minStock" value={formData.minStock} onChange={handleChange} required
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Primary Value & Unit */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Primary Value</label>
                  <input
                    type="number" name="unitValue" value={formData.unitValue}
                    onChange={(e) => handlePrimaryChange('unitValue', e.target.value)}
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Primary Unit <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    name="unit" value={formData.unit}
                    onChange={(e) => handlePrimaryChange('unit', e.target.value)} required
                    style={{
                      height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '8px',
                      border: '1px solid #cbd5e1', outline: 'none', background: 'white'
                    }}
                  >
                    <option value="">Select Primary Unit</option>
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Add Unit List */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary, #ef4444)', borderBottom: '1px dashed #f1f5f9', paddingBottom: '6px', marginTop: '5px' }}>
                <Layers size={16} />
                <span style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit Management</span>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', height: '32px' }}>
                      <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>VALUE</th>
                      <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>UNIT</th>
                      <th style={{ padding: '6px 12px', textAlign: 'left', fontWeight: '700', color: '#475569' }}>SALE PRICE</th>
                      <th style={{ padding: '6px 12px', textAlign: 'center', fontWeight: '700', color: '#475569', width: '80px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unitRows.map((row, index) => (
                      <tr key={row.id} style={{ borderBottom: '1px solid #cbd5e1', height: '44px' }}>
                        <td style={{ padding: '4px 12px' }}>
                          <input
                            type="number" value={row.value}
                            onChange={(e) => handleUnitRowChange(row.id, 'value', e.target.value)}
                            style={{ width: '90%', height: '30px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                          />
                        </td>
                        <td style={{ padding: '4px 12px' }}>
                          <select
                            value={row.unit}
                            onChange={(e) => handleUnitRowChange(row.id, 'unit', e.target.value)}
                            style={{ width: '90%', height: '30px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
                          >
                            <option value="">Select Unit</option>
                            {units.filter(u => {
                              if (index === 0 && u === formData.unit) return true;
                              if (index !== 0 && u === formData.unit) return false;
                              const isSelectedElsewhere = unitRows.some((r, i) => i !== index && r.unit === u);
                              return !isSelectedElsewhere;
                            }).map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </td>
                        <td style={{ padding: '4px 12px' }}>
                          <input
                            type="number" value={row.amount} placeholder="Price"
                            onChange={(e) => handleUnitRowChange(row.id, 'amount', e.target.value)}
                            style={{ width: '90%', height: '30px', padding: '0 8px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                          />
                        </td>
                        <td style={{ padding: '4px 12px', textAlign: 'center' }}>
                          <button
                            type="button" disabled={index === 0}
                            onClick={() => removeUnitRow(row.id)}
                            style={{
                              background: '#f43f5e', color: 'white', border: 'none', padding: '4px 8px',
                              borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '11px',
                              opacity: index === 0 ? 0.4 : 1
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <button
                  type="button" onClick={addUnitRow}
                  style={{
                    background: 'var(--primary, #ef4444)', color: 'white', border: 'none', padding: '6px 12px',
                    borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Plus size={12} /> Add Unit
                </button>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px',
            padding: '15px 20px', borderTop: '1px solid #f1f5f9', background: '#f8fafc'
          }}>
            <button type="button" onClick={onClose} style={{
              height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', color: '#64748b',
              background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{
              height: '38px', padding: '0 16px', fontSize: '13px', fontWeight: '600', color: '#ffffff',
              background: 'var(--primary, #ef4444)', border: 'none', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1
            }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Dynamic Scale Keyframe Style */}
      <style>{`
        @keyframes modalScale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
