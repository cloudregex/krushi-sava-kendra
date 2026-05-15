import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Calendar, Truck, CreditCard, Package, RotateCcw, FileText } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const newItem = () => ({
  id: Date.now() + Math.random(),
  productId: '',
  productName: '',
  currentStock: 0,
  hsnCode: '',
  batchNo: '',
  purchaseQty: 1,
  freeQty: 0,
  unitValue: 1,
  quantity: 1,
  unit: 'Bag',
  purchasePrice: '',
  salePrice: '',
  discountType: '%',
  discountValue: 0,
  taxPercent: '',
  taxAmount: 0,
  totalAmount: 0,
  expiryDate: '',
  availableUnits: [],
  multiUnits: [],
  primaryUnit: 'Bag',
  baseUnitValue: 1
});

const NewPurchaseReturn = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});

  const [master, setMaster] = useState({
    supplierId: '',
    purchaseId: '', // Optional: Link to original purchase
    returnDate: new Date().toISOString().split('T')[0],
    totalQuantity: 0,
    subtotal: 0,
    totalTaxAmount: 0,
    discount: 0,
    discountType: '%',
    grandTotal: 0,
    cashAmount: 0,
    upiAmount: 0,
    swipeAmount: 0,
    creditAmount: 0,
    paidAmount: 0,
    dueAmount: 0,
    reason: '',
    roundOff: 0
  });

  const [items, setItems] = useState([newItem()]);
  const rowToFocus = useRef(null);

  useEffect(() => {
    ApiService.getAll('suppliers').then(data => {
      if (Array.isArray(data)) setSuppliers(data);
    });
    ApiService.getAll('products').then(data => {
      if (Array.isArray(data)) setProducts(data);
    });
  }, []);

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
  }, [items]);

  const [taxBreakdown, setTaxBreakdown] = useState({});

  const calculateTotals = (rows, globalDiscount, paymentFields = {}) => {
    let totalQty = 0, subtotal = 0, totalTax = 0;
    const breakdown = {};
    rows.forEach(item => {
      const qtyFin = parseFloat(item.purchaseQty) || 0;
      const price = parseFloat(item.purchasePrice) || 0;
      const taxP = parseFloat(item.taxPercent) || 0;
      const discVal = parseFloat(item.discountValue) || 0;

      let rowSub = qtyFin * price;
      let discountAmount = item.discountType === '%' ? (rowSub * discVal / 100) : discVal;
      let taxableAmount = Math.max(0, rowSub - discountAmount);
      let rowTax = (taxableAmount * taxP) / 100;

      totalQty += qtyFin;
      subtotal += taxableAmount;
      totalTax += rowTax;

      if (item.productId && taxP > 0) {
        const hsn = item.hsnCode || 'N/A';
        if (!breakdown[hsn]) {
          breakdown[hsn] = { hsn, taxRate: taxP, taxableValue: 0, cgstAmount: 0, sgstAmount: 0, totalTax: 0 };
        }
        breakdown[hsn].taxableValue += taxableAmount;
        breakdown[hsn].cgstAmount += rowTax / 2;
        breakdown[hsn].sgstAmount += rowTax / 2;
        breakdown[hsn].totalTax += rowTax;
      }
    });

    setTaxBreakdown(breakdown);

    const discVal = parseFloat(globalDiscount) || 0;
    const discType = paymentFields.discountType || master.discountType;
    const globalDiscAmount = discType === '%' ? ((subtotal + totalTax) * discVal / 100) : discVal;
    
    const rawGrandTotal = subtotal + totalTax - globalDiscAmount;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = (grandTotal - rawGrandTotal).toFixed(2);

    const cash = parseFloat(paymentFields.cashAmount !== undefined ? paymentFields.cashAmount : master.cashAmount) || 0;
    const upi = parseFloat(paymentFields.upiAmount !== undefined ? paymentFields.upiAmount : master.upiAmount) || 0;
    const swipe = parseFloat(paymentFields.swipeAmount !== undefined ? paymentFields.swipeAmount : master.swipeAmount) || 0;

    const totalPaid = cash + upi + swipe;
    const due = grandTotal - totalPaid;

    setMaster(prev => ({
      ...prev,
      totalQuantity: totalQty,
      subtotal,
      totalTaxAmount: totalTax,
      grandTotal,
      roundOff,
      paidAmount: totalPaid,
      dueAmount: due,
      discount: discVal,
      discountType: discType,
      cashAmount: cash,
      upiAmount: upi,
      swipeAmount: swipe
    }));
  };

  const handleItemChange = (id, field, value, extraData) => {
    if (field === 'productId' && value) {
      const isDuplicate = items.some(item => String(item.productId) === String(value) && item.id !== id);
      if (isDuplicate) {
        toast.error("This product is already added!");
        return false;
      }
    }

    const getStockIncrement = (unitStr, qty, uVal) => {
      const u = (unitStr || '').trim().toLowerCase();
      const q = parseFloat(qty) || 0;
      const uv = parseFloat(uVal) || 1;
      if (u === 'kg' || u === 'kilogram' || u === 'kgs') return q;
      if (u.includes('quintal') || u === 'qtl' || u === 'qntl') return q;
      return q * uv;
    };

    const updated = items.map(item => {
      if (item.id !== id) return item;
      let u = { ...item, [field]: value };

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
          u.freeQty = 0;
          u.quantity = getStockIncrement(u.unit, 1, u.unitValue);

          const prodUnits = [extraData.unit];
          if (extraData.multiUnits && Array.isArray(extraData.multiUnits)) {
            extraData.multiUnits.forEach(mu => {
              if (mu.alternative && !prodUnits.includes(mu.alternative)) prodUnits.push(mu.alternative);
            });
          }
          u.availableUnits = prodUnits.filter(Boolean);
        } else {
          u = newItem();
          u.id = id;
        }
      }

      if (field === 'purchaseQty' || field === 'freeQty' || field === 'unit') {
        let currentUnitValue = u.unitValue;
        if (field === 'unit') {
          if (value === u.primaryUnit) {
            currentUnitValue = u.baseUnitValue;
          } else {
            const mu = u.multiUnits.find(m => m.alternative === value);
            if (mu) currentUnitValue = parseFloat(mu.conversion) || 1;
          }
          u.unitValue = currentUnitValue;
        }
        const totalQtyForIncrement = (parseFloat(field === 'purchaseQty' ? value : u.purchaseQty) || 0) +
                                     (parseFloat(field === 'freeQty' ? value : u.freeQty) || 0);
        u.quantity = getStockIncrement(field === 'unit' ? value : u.unit, totalQtyForIncrement, currentUnitValue);
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
      u.totalAmount = rowSub; // As per user request: row total doesn't subtract discount
      return u;
    });

    setItems(updated);
    calculateTotals(updated, master.discount);

    if (field === 'productId' && value) {
      setTimeout(() => {
        if (qtyRefs.current[id]) qtyRefs.current[id].focus();
      }, 50);
    }
  };

  const addItemRow = () => {
    const r = newItem();
    rowToFocus.current = r.id;
    setItems([...items, r]);
  };

  const handleEnterNavigation = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === items.length - 1) {
        addItemRow();
      } else {
        const nextId = items[index + 1].id;
        const el = rowRefs.current[nextId];
        if (el) el.focus();
      }
    }
  };

  const handleMasterChange = (field, value) => {
    if (['discount', 'discountType', 'cashAmount', 'upiAmount', 'swipeAmount'].includes(field)) {
      const newFields = { [field]: value };
      calculateTotals(items, field === 'discount' ? value : master.discount, newFields);
    } else {
      setMaster(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!master.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid item to return");
      return;
    }

    const payload = {
      ...master,
      items: validItems
    };

    try {
      toast.loading("Processing return...", { id: 'save-return' });
      await ApiService.add('purchase-returns', payload);
      toast.success("Purchase return recorded successfully", { id: 'save-return' });
      navigate('/purchase/returns');
    } catch (error) {
      console.error("Error saving return:", error);
      toast.error("Failed to record purchase return", { id: 'save-return' });
    }
  };

  return (
    <div className="agro-container" style={{ padding: '0 5px' }}>
      <div className="agro-unified-card" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', marginTop: '5px', overflow: 'hidden' }}>
        
        <div className="agro-header-compact" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px', borderBottom: '1px solid var(--border-light)', background: 'white' }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px', color: '#ef4444' }}>New Purchase Return</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Return items to your supplier</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/returns')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Header Section */}
            <div style={{ padding: '12px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#ef4444' }}>
                <RotateCcw size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Return Details</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Supplier</label>
                  <SearchableSelect options={suppliers} value={master.supplierId} onChange={(val) => handleMasterChange('supplierId', val)} placeholder="Search Supplier..." height="36px" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Original Inv No.</label>
                  <input type="text" className="form-control" style={{ height: '36px', fontSize: '13px' }} value={master.purchaseId} onChange={(e) => handleMasterChange('purchaseId', e.target.value)} placeholder="PUR-101" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Return Date</label>
                  <input type="date" className="form-control" style={{ height: '36px', fontSize: '13px' }} value={master.returnDate} onChange={(e) => handleMasterChange('returnDate', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ padding: '10px 15px', background: '#ffffff', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444' }}>
                  <Package size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Return Items</h3>
                </div>
                <button className="btn-agro btn-primary" onClick={addItemRow} style={{ height: '28px', padding: '0 10px', fontSize: '11px', background: '#ef4444' }}>
                  <Plus size={14} /> Add Row
                </button>
              </div>
              
              <div className="agro-table-wrapper-simple" style={{ overflowX: 'auto' }}>
                <table className="agro-table" style={{ border: 'none' }}>
                  <thead style={{ background: '#ffffff' }}>
                    <tr>
                      <th style={{ minWidth: '300px', fontSize: '10px', textAlign: 'left' }}>PRODUCT NAME</th>
                      <th style={{ minWidth: '80px', fontSize: '10px', textAlign: 'center' }}>BATCH NO</th>
                      <th style={{ minWidth: '110px', fontSize: '10px', textAlign: 'center' }}>EXPIRY DATE</th>
                      <th style={{ minWidth: '60px', fontSize: '10px', textAlign: 'center' }}>QTY</th>
                      <th style={{ minWidth: '60px', fontSize: '10px', textAlign: 'center' }}>FREE QTY</th>
                      <th style={{ minWidth: '90px', fontSize: '10px', textAlign: 'center' }}>UNIT</th>
                      <th style={{ minWidth: '90px', fontSize: '10px', textAlign: 'center' }}>STOCK INCR.</th>
                      <th style={{ minWidth: '100px', fontSize: '10px', textAlign: 'center' }}>PURCHASE RATE</th>
                      <th style={{ minWidth: '100px', fontSize: '10px', textAlign: 'center' }}>SALE RATE</th>
                      <th style={{ minWidth: '130px', fontSize: '10px', textAlign: 'center' }}>DISCOUNT</th>
                      <th style={{ minWidth: '70px', fontSize: '10px', textAlign: 'center' }}>TAX %</th>
                      <th style={{ minWidth: '100px', fontSize: '10px', textAlign: 'right', paddingRight: '15px' }}>TOTAL</th>
                      <th style={{ minWidth: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td style={{ minWidth: '300px', paddingLeft: '10px', textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, minWidth: '180px' }}>
                              <SearchableSelect inputRef={el => rowRefs.current[item.id] = el} options={products} value={item.productId} onChange={(val, data) => handleItemChange(item.id, 'productId', val, data)} placeholder="Search Product..." height="34px" />
                            </div>
                            {item.productId && (
                              <div style={{
                                display: 'flex',
                                gap: '6px',
                                fontSize: '10px',
                                fontWeight: '700',
                                color: '#64748b',
                                whiteSpace: 'nowrap',
                                background: '#f1f5f9',
                                padding: '4px 8px',
                                borderRadius: '6px'
                              }}>
                                <span>STK: <span style={{ color: item.currentStock <= 0 ? '#ef4444' : '#166534' }}>{item.currentStock}</span></span>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <span>HSN: {item.hsnCode || 'N/A'}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ minWidth: '80px', padding: '0 4px' }}>
                          <input type="text" className="form-control" style={{ height: '34px', textAlign: 'center' }} value={item.batchNo} onChange={(e) => handleItemChange(item.id, 'batchNo', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} placeholder="Batch" />
                        </td>
                        <td style={{ minWidth: '110px', padding: '0 4px' }}>
                          <input type="date" className="form-control" style={{ height: '34px', textAlign: 'center' }} value={item.expiryDate} onChange={(e) => handleItemChange(item.id, 'expiryDate', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                        </td>
                        <td style={{ minWidth: '60px', padding: '0 4px' }}>
                          <input type="number" className="form-control" style={{ height: '34px', textAlign: 'center' }} value={item.purchaseQty} onChange={(e) => handleItemChange(item.id, 'purchaseQty', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} ref={el => qtyRefs.current[item.id] = el} />
                        </td>
                        <td style={{ minWidth: '60px', padding: '0 4px' }}>
                          <input type="number" className="form-control" style={{ height: '34px', textAlign: 'center', background: '#fffbeb' }} value={item.freeQty} onChange={(e) => handleItemChange(item.id, 'freeQty', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                        </td>
                        <td style={{ minWidth: '90px', padding: '0 4px' }}>
                          <select className="form-control" style={{ height: '34px' }} value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)}>
                            {(item.availableUnits && item.availableUnits.length > 0 ? item.availableUnits : ['Bag', 'Quintal', 'kg']).map((u, i) => <option key={i} value={u}>{u}</option>)}
                          </select>
                        </td>
                        <td style={{ minWidth: '90px', padding: '0 4px' }}>
                          <input type="text" className="form-control" style={{ height: '34px', background: '#f8fafc', textAlign: 'center' }} value={item.quantity} readOnly />
                        </td>
                        <td style={{ minWidth: '100px', padding: '0 4px' }}>
                          <input type="number" className="form-control" style={{ height: '34px', textAlign: 'center' }} value={item.purchasePrice} onChange={(e) => handleItemChange(item.id, 'purchasePrice', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                        </td>
                        <td style={{ minWidth: '100px', padding: '0 4px' }}>
                          <input type="number" className="form-control" style={{ height: '34px', textAlign: 'center' }} value={item.salePrice} onChange={(e) => handleItemChange(item.id, 'salePrice', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                        </td>
                        <td style={{ minWidth: '130px', padding: '0 4px' }}>
                          <div style={{ display: 'flex' }}>
                            <select className="form-control" style={{ width: '50px', height: '34px', borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 0, padding: '0 8px', fontSize: '13px' }} value={item.discountType} onChange={(e) => handleItemChange(item.id, 'discountType', e.target.value)}>
                              <option value="%">%</option>
                              <option value="Amt">₹</option>
                            </select>
                            <input type="number" className="form-control" style={{ height: '34px', width: '80px', textAlign: 'center', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} value={item.discountValue} onChange={(e) => handleItemChange(item.id, 'discountValue', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                          </div>
                        </td>
                        <td style={{ minWidth: '70px', padding: '0 4px' }}>
                          <input type="number" className="form-control" style={{ height: '34px', textAlign: 'center' }} value={item.taxPercent} onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                        </td>
                        <td style={{ minWidth: '100px', fontSize: '13px', fontWeight: '800', color: '#ef4444', textAlign: 'right', paddingRight: '15px' }}>
                          ₹{item.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ minWidth: '40px', textAlign: 'center' }}>
                          <button onClick={() => setItems(items.filter(i => i.id !== item.id))} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: '20px' }}>
              
              {/* Payment Info */}
              <div style={{ padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '8px' }}>
                    <CreditCard size={18} color="#2563eb" />
                  </div>
                  <h3 style={{ fontSize: '14px', margin: 0, fontWeight: '800', color: '#1e293b', letterSpacing: '0.05em' }}>PAYMENT INFO</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '15px' }}>
                  {/* Discount */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '0px 0px', borderRadius: '6px', minWidth: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <select style={{ border: 'none', background: 'transparent', fontWeight: '700', fontSize: '12px', color: '#475569', padding: '8px 5px', outline: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }} value={master.discountType} onChange={(e) => handleMasterChange('discountType', e.target.value)}>
                        <option value="%">Disc %</option>
                        <option value="Amt">Disc ₹</option>
                      </select>
                    </div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }} value={master.discount} onChange={(e) => handleMasterChange('discount', e.target.value)} />
                  </div>

                  {/* Cash */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '8px 10px', borderRadius: '6px', minWidth: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cash Amt</div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }} value={master.cashAmount} onChange={(e) => handleMasterChange('cashAmount', e.target.value)} />
                  </div>

                  {/* UPI */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '8px 10px', borderRadius: '6px', minWidth: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>UPI Amt</div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }} value={master.upiAmount} onChange={(e) => handleMasterChange('upiAmount', e.target.value)} />
                  </div>

                  {/* Swipe */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '8px 10px', borderRadius: '6px', minWidth: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Swipe Amt</div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }} value={master.swipeAmount} onChange={(e) => handleMasterChange('swipeAmount', e.target.value)} />
                  </div>

                  {/* Pending */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #fecaca', borderRadius: '10px', padding: '4px', background: '#fff1f2', gridColumn: 'span 2' }}>
                    <div style={{ background: '#fee2e2', color: '#ef4444', fontWeight: '700', fontSize: '13px', padding: '8px 16px', borderRadius: '6px', minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Pending</div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px 12px', flex: 1, outline: 'none', fontSize: '16px', fontWeight: '700', color: '#ef4444', minWidth: 0 }} value={master.dueAmount} readOnly />
                  </div>

                  {/* Paid */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '4px', background: '#f0fdf4', gridColumn: 'span 2' }}>
                    <div style={{ background: '#dcfce7', color: '#16a34a', fontWeight: '700', fontSize: '13px', padding: '8px 16px', borderRadius: '6px', minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Paid Amt</div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px 12px', flex: 1, outline: 'none', fontSize: '16px', fontWeight: '700', color: '#16a34a', minWidth: 0 }} value={master.paidAmount} readOnly />
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px', display: 'block' }}>Remark / Reason</label>
                  <textarea className="form-control" style={{ height: '80px', background: '#ffffff' }} value={master.reason} onChange={(e) => handleMasterChange('reason', e.target.value)} placeholder="Reason for return..." />
                </div>
              </div>

              {/* Summary */}
              <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#166534', marginBottom: '15px' }}>Return Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#4b5563' }}>Subtotal</span>
                      <span style={{ fontWeight: '700' }}>₹{(parseFloat(master.subtotal) || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#4b5563' }}>Tax Amount</span>
                      <span style={{ fontWeight: '700' }}>₹{(parseFloat(master.totalTaxAmount) || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#4b5563' }}>Discount</span>
                      <span style={{ fontWeight: '700', color: '#ef4444' }}>-₹{(parseFloat(master.discount) || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#4b5563' }}>Round Off</span>
                      <span style={{ fontWeight: '700' }}>{master.roundOff}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#166534' }}>Total Return</span>
                    <span style={{ fontSize: '28px', fontWeight: '900', color: '#16a34a' }}>₹{master.grandTotal}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/returns')} style={{ flex: 1, height: '44px' }}>Cancel</button>
                    <button className="btn-agro btn-primary" onClick={handleSubmit} style={{ flex: 1, height: '44px', background: '#16a34a' }}>
                      <RotateCcw size={18} /> Confirm Return
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tax Breakdown Section */}
            <div style={{ marginTop: "20px", marginBottom: "15px" }}>
              <h3
                style={{
                  fontSize: "13px",
                  marginBottom: "8px",
                  fontWeight: "700",
                  color: "var(--primary)",
                }}
              >
                Tax Breakdown (CGST & SGST)
              </h3>
              <div
                style={{
                  border: "1px solid #94a3b8",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "12px",
                  }}
                >
                  <thead
                    style={{
                      background: "#ffffff",
                      borderBottom: "1px solid #94a3b8",
                    }}
                  >
                    <tr>
                      <th
                        rowSpan="2"
                        style={{
                          padding: "6px 10px",
                          textAlign: "left",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        HSN/SAC
                      </th>
                      <th
                        rowSpan="2"
                        style={{
                          padding: "6px 10px",
                          textAlign: "left",
                          borderRight: "1px solid #94a3b8",
                        }}
                      >
                        Tax Rate
                      </th>
                      <th
                        colSpan="2"
                        style={{
                          padding: "3px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                          borderBottom: "1px solid #94a3b8",
                        }}
                      >
                        CGST
                      </th>
                      <th
                        colSpan="2"
                        style={{
                          padding: "3px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                          borderBottom: "1px solid #94a3b8",
                        }}
                      >
                        SGST / UTGST
                      </th>
                      <th
                        rowSpan="2"
                        style={{ padding: "6px 10px", textAlign: "right" }}
                      >
                        Total Tax
                      </th>
                    </tr>
                    <tr>
                      <th
                        style={{
                          padding: "3px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                          fontWeight: "600",
                        }}
                      >
                        Rate
                      </th>
                      <th
                        style={{
                          padding: "3px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                          fontWeight: "600",
                        }}
                      >
                        Amount
                      </th>
                      <th
                        style={{
                          padding: "3px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                          fontWeight: "600",
                        }}
                      >
                        Rate
                      </th>
                      <th
                        style={{
                          padding: "3px",
                          textAlign: "center",
                          borderRight: "1px solid #94a3b8",
                          fontWeight: "600",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(taxBreakdown).length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "15px",
                            color: "#94a3b8",
                          }}
                        >
                          No products added yet
                        </td>
                      </tr>
                    ) : (
                      Object.values(taxBreakdown).map((b, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td
                            style={{
                              padding: "6px 10px",
                              borderRight: "1px solid #e2e8f0",
                            }}
                          >
                            {b.hsn}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              borderRight: "1px solid #e2e8f0",
                            }}
                          >
                            {b.taxRate}%
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "center",
                              borderRight: "1px solid #e2e8f0",
                            }}
                          >
                            {(b.taxRate / 2).toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "center",
                              borderRight: "1px solid #e2e8f0",
                            }}
                          >
                            ₹{b.cgstAmount.toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "center",
                              borderRight: "1px solid #e2e8f0",
                            }}
                          >
                            {(b.taxRate / 2).toFixed(1)}%
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "center",
                              borderRight: "1px solid #e2e8f0",
                            }}
                          >
                            ₹{b.sgstAmount.toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "6px 10px",
                              textAlign: "right",
                              fontWeight: "700",
                            }}
                          >
                            ₹{b.totalTax.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot style={{ background: "#f8fafc", fontWeight: "800" }}>
                    <tr>
                      <td
                        colSpan="2"
                        style={{
                          padding: "8px 10px",
                          textAlign: "right",
                          borderRight: "1px solid #e2e8f0",
                        }}
                      >
                        Total
                      </td>
                      <td
                        colSpan="2"
                        style={{
                          padding: "8px 10px",
                          textAlign: "center",
                          borderRight: "1px solid #e2e8f0",
                        }}
                      >
                        ₹{Object.values(taxBreakdown).reduce((a, b) => a + b.cgstAmount, 0).toFixed(2)}
                      </td>
                      <td
                        colSpan="2"
                        style={{
                          padding: "8px 10px",
                          textAlign: "center",
                          borderRight: "1px solid #e2e8f0",
                        }}
                      >
                        ₹{Object.values(taxBreakdown).reduce((a, b) => a + b.sgstAmount, 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "right" }}>
                        ₹{Object.values(taxBreakdown).reduce((a, b) => a + b.totalTax, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseReturn;
