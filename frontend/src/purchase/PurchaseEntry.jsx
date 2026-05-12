import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Calendar, Truck, CreditCard, Package } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const newRow = () => ({
  id: Date.now() + Math.random(),
  productId: '',
  productName: '',
  currentStock: 0,
  hsnCode: '',
  batchNo: '',
  purchaseQty: 1,
  unitValue: 1,
  quantity: 1, // This will be the total increment
  unit: 'Bag',
  purchasePrice: '',
  discountType: 'Amt', // 'Amt' or '%'
  discountValue: 0,
  taxPercent: '',
  taxAmount: 0,
  totalAmount: 0,
  purchaseDate: '',
  expiryDate: '',
  availableUnits: [],
  multiUnits: [],
  primaryUnit: 'Bag',
  baseUnitValue: 1
});

const PurchaseEntry = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});

  const [master, setMaster] = useState({
    supplierId: '',
    billDate: new Date().toISOString().split('T')[0],
    totalQuantity: 0,
    subtotal: 0,
    totalTaxAmount: 0,
    discount: 0,
    grandTotal: 0,
    paymentType: 'Cash',
    paidAmount: 0,
    dueAmount: 0
  });

  const [children, setChildren] = useState([newRow()]);
  const rowToFocus = useRef(null);

  useEffect(() => {
    if (rowToFocus.current) {
      setTimeout(() => {
        const el = rowRefs.current[rowToFocus.current];
        if (el) {
          el.focus();
          rowToFocus.current = null;
        }
      }, 100);
    }
  }, [children]);

  const [units, setUnits] = useState([]);

  useEffect(() => {
    ApiService.getAll('suppliers').then(data => setSuppliers(data));
    ApiService.getAll('products').then(data => setProducts(data));
    ApiService.getAll('units').then(data => setUnits(data));
  }, []);

  const calculateTotals = (rows, discount) => {
    let totalQty = 0, subtotal = 0, totalTax = 0;
    rows.forEach(child => {
      const qtyFin = parseFloat(child.purchaseQty) || 0;
      const price = parseFloat(child.purchasePrice) || 0;
      const taxP = parseFloat(child.taxPercent) || 0;
      const discVal = parseFloat(child.discountValue) || 0;

      let rowSub = qtyFin * price;
      let discountAmount = child.discountType === '%' ? (rowSub * discVal / 100) : discVal;
      let taxableAmount = Math.max(0, rowSub - discountAmount);
      let rowTax = (taxableAmount * taxP) / 100;

      totalQty += qtyFin;
      subtotal += taxableAmount;
      totalTax += rowTax;
    });
    const disc = parseFloat(discount) || 0;
    const paid = parseFloat(master.paidAmount) || 0;
    const grandTotal = Math.max(0, subtotal + totalTax - disc);
    setMaster(prev => ({
      ...prev,
      totalQuantity: totalQty,
      subtotal,
      totalTaxAmount: totalTax,
      grandTotal,
      dueAmount: grandTotal - paid,
      discount: disc
    }));
  };

  const handleChildChange = (id, field, value, extraData) => {
    if (field === 'productId' && value) {
      const isDuplicate = children.some(child => String(child.productId) === String(value) && child.id !== id);
      if (isDuplicate) {
        toast.error("This product is already added in the list!");
        return false;
      }
      toast.success(`${extraData?.name || 'Product'} added`);
    }

    const getStockIncrement = (unitStr, qty, uVal) => {
      const u = (unitStr || '').trim().toLowerCase();
      const q = parseFloat(qty) || 0;
      const uv = parseFloat(uVal) || 1;
      if (u === 'kg' || u === 'kilogram' || u === 'kgs') return q;
      if (u.includes('quintal') || u === 'qtl' || u === 'qntl') return q; // Treat input as KG, conversion happens in display
      if (u === 'bag' || u === 'bags') return q * uv;
      return q * uv;
    };

    const updated = children.map(child => {
      if (child.id !== id) return child;
      let u = { ...child, [field]: value };
      if (field === 'productId') {
        if (value && extraData) {
          u.productName = extraData.name || '';
          u.currentStock = extraData.currentStock || 0;
          u.hsnCode = extraData.hsnCode || '';
          u.purchasePrice = parseFloat(extraData.purchasePrice) || '';
          u.taxPercent = parseFloat(extraData.tax) || '';
          u.unit = extraData.unit || 'Bag';
          u.unitValue = parseFloat(extraData.unitValue) || 1;
          u.baseUnitValue = parseFloat(extraData.unitValue) || 1;
          u.primaryUnit = extraData.unit || 'Bag';
          u.multiUnits = extraData.multiUnits || [];
          u.purchaseQty = 1;
          u.quantity = getStockIncrement(u.unit, 1, u.unitValue);
          
          const prodUnits = [extraData.unit];
          if (extraData.multiUnits && Array.isArray(extraData.multiUnits)) {
            extraData.multiUnits.forEach(mu => {
              if (mu.alternative && !prodUnits.includes(mu.alternative)) {
                prodUnits.push(mu.alternative);
              }
            });
          }
          u.availableUnits = prodUnits.filter(Boolean);
        } else {
          // Clear info if product is discarded
          u.productName = '';
          u.currentStock = 0;
          u.hsnCode = '';
          u.purchasePrice = '';
          u.taxPercent = '';
          u.unit = 'Bag';
          u.unitValue = 1;
          u.baseUnitValue = 1;
          u.primaryUnit = 'Bag';
          u.multiUnits = [];
          u.purchaseQty = 1;
          u.quantity = 1;
          u.availableUnits = [];
        }
      }

      if (field === 'purchaseQty' || field === 'unit') {
        let currentUnitValue = u.unitValue;
        if (field === 'unit') {
          const selectedUnit = value;
          if (selectedUnit === u.primaryUnit) {
            currentUnitValue = u.baseUnitValue;
          } else {
            const mu = u.multiUnits.find(m => m.alternative === selectedUnit);
            if (mu) currentUnitValue = parseFloat(mu.conversion) || 1;
          }
          u.unitValue = currentUnitValue;
        }

        u.quantity = getStockIncrement(
          field === 'unit' ? value : u.unit,
          field === 'purchaseQty' ? value : u.purchaseQty,
          currentUnitValue
        );
      }

      const qtyForTotal = parseFloat(field === 'purchaseQty' ? value : u.purchaseQty) || 0;
      const price = parseFloat(field === 'purchasePrice' ? value : u.purchasePrice) || 0;
      const taxP = parseFloat(field === 'taxPercent' ? value : u.taxPercent) || 0;
      const discVal = parseFloat(field === 'discountValue' ? value : u.discountValue) || 0;
      const discType = field === 'discountType' ? value : u.discountType;

      let rowSub = qtyForTotal * price;
      let discountAmount = discType === '%' ? (rowSub * discVal / 100) : discVal;
      let taxableAmount = Math.max(0, rowSub - discountAmount);
      let rowTax = (taxableAmount * taxP) / 100;

      u.taxAmount = rowTax;
      u.totalAmount = taxableAmount + rowTax;
      return u;
    });
    setChildren(updated);
    calculateTotals(updated, master.discount);

    if (field === 'productId' && value) {
      setTimeout(() => {
        if (qtyRefs.current[id]) qtyRefs.current[id].focus();
      }, 50);
    }
    return true;
  };

  const addChildRow = () => {
    const r = newRow();
    rowToFocus.current = r.id;
    setChildren(prev => [...prev, r]);
  };

  const removeChildRow = (id) => {
    if (children.length > 1) {
      const updated = children.filter(c => c.id !== id);
      setChildren(updated);
      calculateTotals(updated, master.discount);
    } else {
      // If it's the last row, just clear it
      setChildren([newRow()]);
      calculateTotals([newRow()], master.discount);
    }
  };

  const handleProductEnterSelect = () => addChildRow();

  const handleEnterNavigation = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === children.length - 1) {
        addChildRow();
      } else {
        const nextId = children[index + 1].id;
        const el = rowRefs.current[nextId];
        if (el) el.focus();
      }
    }
  };

  const handleMasterChange = (field, value) => {
    const updated = { ...master, [field]: value };
    if (field === 'discount' || field === 'paidAmount') {
      const disc = parseFloat(field === 'discount' ? value : master.discount) || 0;
      const paid = parseFloat(field === 'paidAmount' ? value : master.paidAmount) || 0;
      updated.grandTotal = Math.max(0, updated.subtotal + updated.totalTaxAmount - disc);
      updated.dueAmount = updated.grandTotal - paid;
    }
    setMaster(updated);
  };

  const handleSubmit = async () => {
    if (!master.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    const validRows = children.filter(c => c.productId && parseFloat(c.quantity) > 0);
    if (validRows.length === 0) {
      toast.error("Please add at least one valid product");
      return;
    }

    try {
      const payload = {
        ...master,
        items: validRows
      };
      await ApiService.save('purchases', payload);
      toast.success("Purchase Bill saved successfully!");
      navigate('/purchase/bills');
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save bill. Please try again.");
    }
  };

  return (
    <div className="agro-container">
      <div className="agro-unified-card">
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>New Purchase Entry</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Add a new stock purchase bill</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/bills')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Supplier Details Section */}
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                <Truck size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Supplier Details</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Supplier</label>
                  <SearchableSelect
                    options={suppliers}
                    value={master.supplierId}
                    onChange={(val) => handleMasterChange('supplierId', val)}
                    placeholder="Search Supplier..."
                    height="36px"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Bill Date</label>
                  <input type="date" className="form-control" style={{ height: '36px', fontSize: '13px' }} value={master.billDate} onChange={(e) => handleMasterChange('billDate', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Product Table Section */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 15px', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                  <Package size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Products</h3>
                </div>
                <button className="btn-agro btn-primary" onClick={addChildRow} style={{ height: '28px', padding: '0 10px', fontSize: '11px', background: 'var(--primary)' }}>
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div className="agro-table-wrapper-simple" style={{ overflowX: 'auto' }}>
                <table className="agro-table" style={{ border: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '220px', fontSize: '11px' }}>PRODUCT NAME</th>
                      <th style={{ width: '90px', fontSize: '11px', textAlign: 'center' }}>STOCK</th>
                      <th style={{ width: '90px', fontSize: '11px', textAlign: 'center' }}>QTY (Bags)</th>
                      <th style={{ width: '110px', fontSize: '11px', textAlign: 'center' }}>UNIT</th>
                      <th style={{ width: '130px', fontSize: '11px', textAlign: 'center' }}>STOCK INCREMENT</th>
                      <th style={{ width: '100px', fontSize: '11px', textAlign: 'center' }}>RATE</th>
                      <th style={{ width: '120px', fontSize: '11px', textAlign: 'center' }}>DISCOUNT</th>
                      <th style={{ width: '80px', fontSize: '11px', textAlign: 'center' }}>TAX %</th>
                      <th style={{ width: '110px', fontSize: '11px', textAlign: 'right', paddingRight: '15px' }}>TOTAL</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((child, idx) => (
                      <tr key={child.id}>
                        <td style={{ width: '250px' }}>
                          <SearchableSelect
                            options={products}
                            value={child.productId}
                            onChange={(val, data) => handleChildChange(child.id, 'productId', val, data)}
                            placeholder="Search Product..."
                            height="34px"
                          />
                        </td>
                        <td style={{ textAlign: 'center', width: '90px' }}>
                          <span style={{
                            background: child.currentStock <= 0 ? '#fee2e2' : '#dcfce7',
                            color: child.currentStock <= 0 ? '#991b1b' : '#166534',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700'
                          }}>
                            {child.currentStock} Qty
                          </span>
                        </td>
                        <td style={{ width: '90px' }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{ height: '34px', fontSize: '12px', textAlign: 'center' }}
                            value={child.purchaseQty}
                            onChange={(e) => handleChildChange(child.id, 'purchaseQty', e.target.value)}
                          />
                        </td>
                        <td style={{ width: '110px' }}>
                          <select
                            className="form-control"
                            style={{ height: '34px', fontSize: '12px', padding: '0 5px' }}
                            value={child.unit}
                            onChange={(e) => handleChildChange(child.id, 'unit', e.target.value)}
                          >
                            {(child.availableUnits && child.availableUnits.length > 0 ? child.availableUnits : ['Bag']).map((uName, i) => (
                              <option key={i} value={uName}>{uName}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ width: '130px' }}>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ height: '34px', fontSize: '12px', paddingRight: '45px', background: '#f8fafc', textAlign: 'center' }}
                              value={
                                (child.unit || '').trim().toLowerCase().includes('quintal') ||
                                  (child.unit || '').trim().toLowerCase() === 'qtl' ||
                                  (child.unit || '').trim().toLowerCase() === 'qntl'
                                  ? (parseFloat(child.quantity) / 100).toFixed(2)
                                  : Math.floor(parseFloat(child.quantity))
                              }
                              readOnly
                            />
                            <span style={{
                              position: 'absolute',
                              right: '8px',
                              fontSize: '10px',
                              color: '#64748b',
                              fontWeight: '700',
                              pointerEvents: 'none'
                            }}>
                              kg
                            </span>
                          </div>
                        </td>
                        <td style={{ width: '100px' }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{ height: '34px', fontSize: '12px', textAlign: 'center' }}
                            value={child.purchasePrice}
                            onChange={(e) => handleChildChange(child.id, 'purchasePrice', e.target.value)}
                            onKeyDown={(e) => handleEnterNavigation(e, idx)}
                          />
                        </td>
                        <td style={{ width: '120px' }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            <select
                              className="form-control"
                              style={{ width: '45px', height: '34px', fontSize: '10px', padding: '0 2px' }}
                              value={child.discountType}
                              onChange={(e) => handleChildChange(child.id, 'discountType', e.target.value)}
                            >
                              <option value="Amt">₹</option>
                              <option value="%">%</option>
                            </select>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '34px', fontSize: '12px', flex: 1, textAlign: 'center' }}
                              value={child.discountValue}
                              onChange={(e) => handleChildChange(child.id, 'discountValue', e.target.value)}
                            />
                          </div>
                        </td>
                        <td style={{ width: '80px' }}>
                          <input
                            type="number"
                            className="form-control"
                            style={{ height: '34px', fontSize: '12px', textAlign: 'center' }}
                            value={child.taxPercent}
                            onChange={(e) => handleChildChange(child.id, 'taxPercent', e.target.value)}
                          />
                        </td>
                        <td style={{ fontSize: '14px', fontWeight: '800', color: '#22c55e', textAlign: 'right', paddingRight: '15px', width: '110px' }}>
                          ₹{child.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button" onClick={() => removeChildRow(child.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Summary Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 10px 0', fontWeight: '700', color: 'var(--primary)' }}>Payment Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px' }}>Payment Type</label>
                    <select className="form-control" style={{ width: '120px', height: '36px', fontSize: '13px', padding: '0 10px' }} value={master.paymentType} onChange={(e) => handleMasterChange('paymentType', e.target.value)}>
                      <option value="Cash">Cash</option>
                      <option value="Swipe">Swipe</option>
                      <option value="UPI">UPI</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px' }}>Discount (₹)</label>
                    <input type="number" className="form-control" style={{ width: '120px', height: '32px', fontSize: '12px' }} value={master.discount} onChange={(e) => handleMasterChange('discount', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px' }}>Paid Amount (₹)</label>
                    <input type="number" className="form-control" style={{ width: '120px', height: '32px', fontSize: '12px' }} value={master.paidAmount} onChange={(e) => handleMasterChange('paidAmount', e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ef4444', fontWeight: '700', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                    <label style={{ fontSize: '12px' }}>Balance Due</label>
                    <span style={{ fontSize: '14px' }}>₹{(parseFloat(master.dueAmount) || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '15px', background: 'var(--primary-soft)', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 10px 0', fontWeight: '700', color: 'var(--primary)' }}>Bill Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Subtotal</span>
                    <span>₹{(parseFloat(master.subtotal) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Tax Amount</span>
                    <span>₹{(parseFloat(master.totalTaxAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Discount</span>
                    <span>-₹{(parseFloat(master.discount) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'white', margin: '5px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>
                    <span>Grand Total</span>
                    <span>₹{(parseFloat(master.grandTotal) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/bills')} style={{ flex: 1, height: '38px', fontSize: '13px' }}>Cancel</button>
                    <button className="btn-agro btn-primary" onClick={handleSubmit} style={{ flex: 1, height: '38px', fontSize: '13px', background: 'var(--primary)' }}><Save size={18} /> Save Bill</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Breakdown Table */}
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontSize: '13px', marginBottom: '8px', fontWeight: '700', color: 'var(--primary)' }}>Tax Breakdown (CGST & SGST)</h3>
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)' }}>
                  <tr>
                    <th rowSpan="2" style={{ padding: '6px 10px', textAlign: 'left', borderRight: '1px solid var(--border-light)' }}>Tax Rate</th>
                    <th colSpan="2" style={{ padding: '3px', textAlign: 'center', borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>CGST</th>
                    <th colSpan="2" style={{ padding: '3px', textAlign: 'center', borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>SGST / UTGST</th>
                    <th rowSpan="2" style={{ padding: '6px 10px', textAlign: 'right' }}>Total Tax</th>
                  </tr>
                  <tr>
                    <th style={{ padding: '3px', textAlign: 'center', borderRight: '1px solid var(--border-light)', fontWeight: '600' }}>Rate</th>
                    <th style={{ padding: '3px', textAlign: 'center', borderRight: '1px solid var(--border-light)', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '3px', textAlign: 'center', borderRight: '1px solid var(--border-light)', fontWeight: '600' }}>Rate</th>
                    <th style={{ padding: '3px', textAlign: 'center', borderRight: '1px solid var(--border-light)', fontWeight: '600' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(children.reduce((acc, item) => {
                    if (!item.productId) return acc;
                    const rate = parseFloat(item.taxPercent) || 0;
                    if (!acc[rate]) {
                      acc[rate] = { rate, cgstAmount: 0, sgstAmount: 0, totalTax: 0 };
                    }
                    const itemTax = ((parseFloat(item.purchasePrice) || 0) * (parseFloat(item.purchaseQty) || 0) * rate) / 100;
                    acc[rate].cgstAmount += itemTax / 2;
                    acc[rate].sgstAmount += itemTax / 2;
                    acc[rate].totalTax += itemTax;
                    return acc;
                  }, {})).map((tax, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 10px', borderRight: '1px solid var(--border-light)' }}>{tax.rate}%</td>
                      <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>{(tax.rate / 2).toFixed(2)}%</td>
                      <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>₹{(tax.cgstAmount).toFixed(2)}</td>
                      <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>{(tax.rate / 2).toFixed(2)}%</td>
                      <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>₹{(tax.sgstAmount).toFixed(2)}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '700' }}>₹{tax.totalTax.toFixed(2)}</td>
                    </tr>
                  ))}
                  {children.filter(c => c.productId).length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '10px', textAlign: 'center', color: '#64748b', fontStyle: 'italic' }}>No products added yet</td>
                    </tr>
                  )}
                </tbody>
                <tfoot style={{ background: '#f8fafc', fontWeight: '800' }}>
                  <tr>
                    <td style={{ padding: '6px 10px', borderRight: '1px solid var(--border-light)' }}>Total</td>
                    <td style={{ borderRight: '1px solid var(--border-light)' }}></td>
                    <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>₹{(children.reduce((sum, item) => sum + ((parseFloat(item.purchasePrice) || 0) * (parseFloat(item.purchaseQty) || 0) * (parseFloat(item.taxPercent) || 0) / 100), 0) / 2).toFixed(2)}</td>
                    <td style={{ borderRight: '1px solid var(--border-light)' }}></td>
                    <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid var(--border-light)' }}>₹{(children.reduce((sum, item) => sum + ((parseFloat(item.purchasePrice) || 0) * (parseFloat(item.purchaseQty) || 0) * (parseFloat(item.taxPercent) || 0) / 100), 0) / 2).toFixed(2)}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'right' }}>₹{children.reduce((sum, item) => sum + ((parseFloat(item.purchasePrice) || 0) * (parseFloat(item.purchaseQty) || 0) * (parseFloat(item.taxPercent) || 0) / 100), 0).toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntry;
