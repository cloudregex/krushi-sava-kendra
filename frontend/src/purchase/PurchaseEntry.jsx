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
  batchNo: '',
  quantity: 1,
  purchasePrice: '',
  salePrice: '',
  mrp: '',
  taxPercent: '',
  taxAmount: 0,
  totalAmount: 0,
  purchaseDate: '',
  expiryDate: ''
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

  useEffect(() => {
    ApiService.getAll('suppliers').then(data => setSuppliers(data));
    ApiService.getAll('products').then(data => setProducts(data));
  }, []);

  const calculateTotals = (rows, discount) => {
    let totalQty = 0, subtotal = 0, totalTax = 0;
    rows.forEach(child => {
      const qty = parseFloat(child.quantity) || 0;
      const price = parseFloat(child.purchasePrice) || 0;
      const taxP = parseFloat(child.taxPercent) || 0;
      const rowSub = qty * price;
      const rowTax = (rowSub * taxP) / 100;
      totalQty += qty;
      subtotal += rowSub;
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
    // Check for duplicate products
    if (field === 'productId' && value) {
      const isDuplicate = children.some(child => String(child.productId) === String(value) && child.id !== id);
      if (isDuplicate) {
        toast.error("This product is already added in the list!");
        return false;
      }
      toast.success(`${extraData?.name || 'Product'} added`);
    }

    const updated = children.map(child => {
      if (child.id !== id) return child;
      let u = { ...child, [field]: value };
      if (field === 'productId') {
        if (extraData) {
          u.productName = extraData.name || '';
          u.batchNo = extraData.batchNo || '';
          u.purchasePrice = parseFloat(extraData.purchasePrice) || '';
          u.salePrice = parseFloat(extraData.salePrice) || '';
          u.mrp = parseFloat(extraData.mrp) || '';
          u.taxPercent = parseFloat(extraData.tax) || '';
        } else if (!value) {
          u.productName = '';
          u.batchNo = '';
          u.purchasePrice = '';
          u.salePrice = '';
          u.mrp = '';
          u.taxPercent = '';
          u.amount = 0;
          u.taxAmount = 0;
        }
      }
      // Use 1 as default quantity for calculation if empty or <= 0
      const rawQty = parseFloat(field === 'quantity' ? value : u.quantity);
      const qty = (isNaN(rawQty) || rawQty <= 0) ? 1 : rawQty;
      
      const price = parseFloat(field === 'purchasePrice' ? value : u.purchasePrice) || 0;
      const taxP = parseFloat(field === 'taxPercent' ? value : u.taxPercent) || 0;
      const rowSub = qty * price;
      const rowTax = (rowSub * taxP) / 100;
      u.taxAmount = rowTax;
      u.totalAmount = rowSub + rowTax;
      return u;
    });
    setChildren(updated);
    calculateTotals(updated, master.discount);

    // Auto-focus quantity field after selecting a product
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
    const val = ['discount', 'paidAmount'].includes(field) ? (parseFloat(value) || 0) : value;
    const updated = { ...master, [field]: val };
    if (field === 'discount' || field === 'paidAmount') {
      const disc = field === 'discount' ? val : master.discount;
      const paid = field === 'paidAmount' ? val : master.paidAmount;
      updated.grandTotal = Math.max(0, updated.subtotal + updated.totalTaxAmount - disc);
      updated.dueAmount = updated.grandTotal - paid;
    }
    setMaster(updated);
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
                      <th style={{ width: '220px' }}>PRODUCT NAME</th>
                      <th style={{ width: '70px' }}>QTY</th>
                      <th style={{ width: '90px' }}>P.RATE</th>
                      <th style={{ width: '90px' }}>S.RATE</th>
                      <th style={{ width: '80px' }}>MRP</th>
                      <th style={{ width: '60px' }}>TAX%</th>
                      <th style={{ width: '110px' }}>MFG. DATE</th>
                      <th style={{ width: '110px' }}>EXP. DATE</th>
                      <th style={{ width: '100px' }}>AMOUNT</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((child, idx) => (
                      <tr key={child.id}>
                        <td>
                          <SearchableSelect
                            options={products}
                            value={child.productId}
                            onChange={(val, data) => handleChildChange(child.id, 'productId', val, data)}
                            onEnterSelect={handleProductEnterSelect}
                            placeholder="Search Product..."
                            height="34px"
                            inputRef={el => rowRefs.current[child.id] = el}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-control" 
                            style={{ height: '34px', fontSize: '12px' }} 
                            ref={el => qtyRefs.current[child.id] = el}
                            value={child.quantity} 
                            onChange={(e) => handleChildChange(child.id, 'quantity', e.target.value)} 
                            onBlur={(e) => {
                              if (!e.target.value || parseFloat(e.target.value) <= 0) {
                                handleChildChange(child.id, 'quantity', '1');
                              }
                            }}
                            onKeyDown={(e) => handleEnterNavigation(e, idx)} 
                          />
                        </td>
                        <td><input type="number" className="form-control" style={{ height: '34px', fontSize: '12px' }} value={child.purchasePrice} onChange={(e) => handleChildChange(child.id, 'purchasePrice', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td><input type="number" className="form-control" style={{ height: '34px', fontSize: '12px' }} value={child.salePrice} onChange={(e) => handleChildChange(child.id, 'salePrice', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td><input type="number" className="form-control" style={{ height: '34px', fontSize: '12px' }} value={child.mrp} onChange={(e) => handleChildChange(child.id, 'mrp', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td><input type="number" className="form-control" style={{ height: '34px', fontSize: '12px' }} value={child.taxPercent} onChange={(e) => handleChildChange(child.id, 'taxPercent', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td><input type="date" className="form-control" style={{ height: '34px', fontSize: '12px', padding: '0 5px' }} value={child.purchaseDate} onChange={(e) => handleChildChange(child.id, 'purchaseDate', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td><input type="date" className="form-control" style={{ height: '34px', fontSize: '12px', padding: '0 5px' }} value={child.expiryDate} onChange={(e) => handleChildChange(child.id, 'expiryDate', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td style={{ fontSize: '13px', fontWeight: '700' }}>₹{child.totalAmount.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => removeChildRow(child.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
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
                    <span style={{ fontSize: '14px' }}>₹{master.dueAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '15px', background: 'var(--primary-soft)', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <h3 style={{ fontSize: '13px', margin: '0 0 10px 0', fontWeight: '700', color: 'var(--primary)' }}>Bill Summary</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Subtotal</span>
                    <span>₹{master.subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Tax Amount</span>
                    <span>₹{master.totalTaxAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span>Discount</span>
                    <span>-₹{master.discount.toFixed(2)}</span>
                  </div>
                  <div style={{ height: '1px', background: 'white', margin: '5px 0' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '900', color: 'var(--primary)' }}>
                    <span>Grand Total</span>
                    <span>₹{master.grandTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/bills')} style={{ flex: 1, height: '38px', fontSize: '13px' }}>Cancel</button>
                    <button className="btn-agro btn-primary" style={{ flex: 1, height: '38px', fontSize: '13px', background: 'var(--primary)' }}><Save size={18} /> Save Bill</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntry;
