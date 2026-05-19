import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Calendar, CreditCard, Package, RotateCcw, Search, Info } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import SearchableSelect from './SearchableSelect';
import api from '../adminauth/utils/api';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const newItem = () => ({
  id: Date.now() + Math.random(),
  productId: '',
  productName: '',
  currentStock: 0,
  hsnCode: '',
  batchNo: '',
  expiryDate: '',
  quantity: 1, // Return Qty
  unit: 'Bag',
  unitValue: 1,
  rate: '', // Sale Rate
  discountType: '%',
  discountValue: 0,
  taxPercent: '',
  taxAmount: 0,
  totalAmount: 0,
  reason: 'Customer Return',
  availableUnits: [],
  multiUnits: [],
  primaryUnit: 'Bag',
  baseUnitValue: 1,
  stockIncrement: 1,
  conversionFactor: 1
});

const NewSaleReturn = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [master, setMaster] = useState({
    customerId: '',
    returnDate: '',
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
    ApiService.getAll('customers').then(data => {
      if (Array.isArray(data)) setCustomers(data);
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
  }, []);

  useEffect(() => {
    if (id && products.length > 0 && customers.length > 0) {
      ApiService.getById('sales/returns', id).then(response => {
        if (response) {
          const ret = response.returnData || response;
          const retItems = response.items || [];
          
          setMaster({
            customerId: ret.customerId || '',
            returnDate: ret.returnDate ? ret.returnDate.split('T')[0] : '',
            totalQuantity: parseFloat(ret.totalQuantity) || 0,
            subtotal: parseFloat(ret.subtotal) || 0,
            totalTaxAmount: parseFloat(ret.totalTaxAmount) || 0,
            discount: parseFloat(ret.discount) || 0,
            discountType: ret.discountType || '%',
            grandTotal: parseFloat(ret.grandTotal) || 0,
            cashAmount: parseFloat(ret.cashAmount) || (ret.refundMode === 'Cash' ? parseFloat(ret.refundAmount) || 0 : 0),
            upiAmount: parseFloat(ret.upiAmount) || (ret.refundMode === 'UPI' ? parseFloat(ret.refundAmount) || 0 : 0),
            swipeAmount: parseFloat(ret.swipeAmount) || (ret.refundMode === 'Swipe' ? parseFloat(ret.refundAmount) || 0 : 0),
            creditAmount: parseFloat(ret.creditAmount) || 0,
            paidAmount: parseFloat(ret.paidAmount) || parseFloat(ret.refundAmount) || 0,
            dueAmount: parseFloat(ret.dueAmount) || 0,
            reason: ret.reason || '',
            roundOff: parseFloat(ret.roundOff) || 0,
            saleId: ret.saleId || ''
          });

          setItems(retItems.map(item => {
            const prod = products.find(p => String(p.id) === String(item.productId)) || item.product || {};
            const multiUnits = prod.multiUnits ? (typeof prod.multiUnits === 'string' ? JSON.parse(prod.multiUnits) : prod.multiUnits) : [];
            const availableUnits = [prod.unit, ...multiUnits.map(mu => mu.unitName)].filter(Boolean);

            return {
              id: item.id || Date.now() + Math.random(),
              productId: item.productId,
              productName: prod.name || '',
              currentStock: prod.currentStock || 0,
              hsnCode: prod.hsnCode || '',
              batchNo: item.batchNo || '',
              expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
              quantity: parseFloat(item.quantity) || 0,
              unit: item.unit || prod.unit || 'Bag',
              rate: parseFloat(item.rate) || 0,
              discountType: item.discountType || '%',
              discountValue: parseFloat(item.discountValue) || 0,
              taxPercent: parseFloat(item.taxPercent) || 0,
              taxAmount: parseFloat(item.taxAmount) || 0,
              totalAmount: parseFloat(item.totalAmount) || 0,
              reason: item.reason || 'Customer Return',
              availableUnits,
              multiUnits,
              primaryUnit: prod.unit || 'Bag',
              stockIncrement: parseFloat(item.stockIncrement) || 1,
              conversionFactor: 1
            };
          }));
        }
      }).catch(err => {
        console.error("Error loading sales return for edit:", err);
        toast.error("Failed to load sales return details");
      });
    }
  }, [id, products, customers]);

  const [taxBreakdown, setTaxBreakdown] = useState({});

  const calculateTotals = (rows) => {
    let totalQty = 0, rawSubtotal = 0, totalRowDiscount = 0, totalTax = 0;
    const breakdown = {};
    
    rows.forEach(item => {
      const qtyFin = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.rate) || 0;
      const taxP = parseFloat(item.taxPercent) || 0;
      const discVal = parseFloat(item.discountValue) || 0;

      let rowSub = qtyFin * price;
      let discountAmount = item.discountType === '%' ? (rowSub * discVal / 100) : discVal;
      let taxableAmount = Math.max(0, rowSub - discountAmount);
      let rowTax = (taxableAmount * taxP) / 100;

      totalQty += qtyFin;
      rawSubtotal += rowSub;
      totalRowDiscount += discountAmount;
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

    setMaster(prev => {
      const discVal = parseFloat(prev.discount) || 0;
      const discType = prev.discountType;
      
      const afterRowSub = rawSubtotal - totalRowDiscount;
      const globalDiscAmount = discType === '%' ? ((afterRowSub + totalTax) * discVal / 100) : discVal;
      
      const rawGrandTotal = afterRowSub + totalTax - globalDiscAmount;
      const grandTotal = Math.round(rawGrandTotal);
      const roundOff = (grandTotal - rawGrandTotal).toFixed(2);

      const cash = parseFloat(prev.cashAmount) || 0;
      const upi = parseFloat(prev.upiAmount) || 0;
      const swipe = parseFloat(prev.swipeAmount) || 0;

      const totalPaid = cash + upi + swipe;
      const due = grandTotal - totalPaid;

      return {
        ...prev,
        totalQuantity: totalQty,
        subtotal: rawSubtotal,
        rowDiscountAmount: totalRowDiscount,
        masterDiscountAmount: globalDiscAmount,
        totalTaxAmount: totalTax,
        grandTotal,
        roundOff,
        paidAmount: totalPaid,
        dueAmount: due
      };
    });
  };

  useEffect(() => {
    calculateTotals(items);
  }, [
    items,
    master.discount,
    master.discountType,
    master.cashAmount,
    master.upiAmount,
    master.swipeAmount
  ]);

  const handleItemChange = (id, field, value, extraData) => {
    if (field === 'productId' && value) {
      const isDuplicate = items.some(item => String(item.productId) === String(value) && item.id !== id);
      if (isDuplicate) {
        toast.error("This product is already added!");
        return false;
      }
    }

    const updated = items.map(item => {
      if (item.id !== id) return item;
      let u = { ...item, [field]: value };

      if (field === 'productId') {
        if (value && extraData) {
          u.productName = extraData.name || '';
          u.currentStock = extraData.currentStock || 0;
          u.hsnCode = extraData.hsnCode || '';
          u.rate = (extraData.salePrice !== undefined && extraData.salePrice !== null && extraData.salePrice !== '') ? extraData.salePrice : (extraData.multiUnits && extraData.multiUnits.length > 0 ? extraData.multiUnits[0].amount : '');
          u.taxPercent = parseFloat(extraData.tax) || 0;
          u.unit = extraData.unit || 'Bag';
          u.unitValue = parseFloat(extraData.unitValue) || 1;
          u.baseUnitValue = parseFloat(extraData.unitValue) || 1;
          u.primaryUnit = extraData.unit || 'Bag';
          u.multiUnits = extraData.multiUnits || [];
          u.quantity = 1;
          u.stockIncrement = 1;
          u.conversionFactor = 1;
          u.batchNo = '';
          u.expiryDate = '';

          // Fetch Batch Info from latest sales logs
          api.get(`/products/${value}/latest-batch`).then(res => {
            if (res.data) {
              const latest = res.data;
              setItems(prev => prev.map(it => it.id === id ? {
                ...it,
                batchNo: '',
                prevBatchNo: latest.batchNo || '',
                expiryDate: latest.expiryDate ? latest.expiryDate.split('T')[0] : ''
              } : it));
            }
          }).catch(err => console.error("Error fetching batches:", err));

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

      if (field === 'unit') {
        const prod = products.find(p => String(p.id) === String(u.productId));
        const mu = u.multiUnits.find(m => m.alternative === value);
        u.conversionFactor = mu ? (parseFloat(mu.conversion) || 1) : 1;
        if (value === u.primaryUnit) {
          if (prod) {
            u.rate = (prod.salePrice !== undefined && prod.salePrice !== null && prod.salePrice !== '') ? prod.salePrice : '';
          }
        } else if (mu && mu.amount !== undefined && mu.amount !== null && mu.amount !== '') {
          u.rate = mu.amount;
        }
      }

      // Sync Quantity if Stock Increment is changed manually
      if (field === 'stockIncrement') {
        const factor = parseFloat(u.conversionFactor) || 1;
        const incVal = parseFloat(value) || 0;
        u.quantity = Math.max(0, incVal * factor);
      }

      const qty = parseFloat(u.quantity) || 0;
      const factor = parseFloat(u.conversionFactor) || 1;

      // Recalculate Stock Increment if Quantity/Unit changes
      if (['quantity', 'unit', 'productId'].includes(field)) {
        u.stockIncrement = qty / factor;
      }

      const price = parseFloat(u.rate) || 0;
      const taxP = parseFloat(u.taxPercent) || 0;
      const discVal = parseFloat(u.discountValue) || 0;
      const discType = u.discountType;

      let rowSub = qty * price;
      let discountAmount = discType === '%' ? (rowSub * discVal / 100) : discVal;
      let taxableAmount = Math.max(0, rowSub - discountAmount);
      let rowTax = (taxableAmount * taxP) / 100;

      u.taxAmount = rowTax;
      u.totalAmount = taxableAmount + rowTax;
      return u;
    });

    setItems(updated);

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

  const removeItemRow = (id) => {
    if (items.length > 1) {
      setItems(items.filter(c => c.id !== id));
    } else {
      setItems([newItem()]);
    }
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
    if (field === 'customerId') {
      setMaster(prev => ({
        ...prev,
        [field]: value,
        returnDate: value ? new Date().toISOString().split('T')[0] : ''
      }));
    } else {
      setMaster(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!master.customerId) {
      toast.error("Please select a customer");
      return;
    }
    if (!master.returnDate) {
      toast.error("Please select a Return Date");
      return;
    }
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid item to return");
      return;
    }

    const payload = {
      customerId: master.customerId,
      saleId: master.saleId || null,
      returnDate: master.returnDate,
      subtotal: master.subtotal,
      taxAmount: master.totalTaxAmount,
      discountAmount: master.discount,
      grandTotal: master.grandTotal,
      refundMode: master.cashAmount > 0 ? 'Cash' : master.upiAmount > 0 ? 'UPI' : 'Adjust',
      refundAmount: master.paidAmount,
      roundOff: master.roundOff,
      reason: master.reason || 'Customer Return',
      items: validItems.map(item => ({
        productId: item.productId,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate || null,
        quantity: item.quantity,
        unit: item.unit,
        rate: item.rate,
        taxPercent: item.taxPercent,
        taxAmount: item.taxAmount,
        totalAmount: item.totalAmount,
        reason: item.reason
      }))
    };

    try {
      toast.loading(id ? "Updating return..." : "Processing return...", { id: 'save-return' });
      if (id) {
        await ApiService.update('sales/returns', id, payload);
        toast.success("Sales Return Updated Successfully", { id: 'save-return' });
      } else {
        await ApiService.add('sales/returns', payload);
        toast.success("Sales Return Recorded Successfully", { id: 'save-return' });
      }
      navigate('/sales/returns');
    } catch (error) {
      console.error("Error saving return:", error);
      toast.error(id ? "Failed to update sales return" : "Failed to record sales return", { id: 'save-return' });
    }
  };

  const customerOptions = customers.map(c => ({
    id: c.id,
    name: c.name,
    city: c.mobile ? `Mobile: ${c.mobile}` : 'No Mobile'
  }));

  return (
    <div className="agro-container" style={{ padding: '0 5px' }}>
      <div className="agro-unified-card" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-light)', marginTop: '5px', overflow: 'hidden' }}>
        
        {/* Header Section */}
        <div className="agro-header-compact" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px', borderBottom: '1px solid var(--border-light)', background: 'white' }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px', color: '#ef4444' }}>{id ? "Edit Sale Return" : "New Sale Return"}</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>{id ? "Modify returned items from your customer" : "Return items from your customer"}</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate('/sales/returns')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Customer & Return Details Section */}
            <div style={{ padding: '12px', background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#ef4444' }}>
                <RotateCcw size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Customer Return Details</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Customer</label>
                  <SearchableSelect options={customerOptions} value={master.customerId} onChange={(val) => handleMasterChange('customerId', val)} placeholder="Search Customer..." height="36px" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Reason for Return</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    style={{ height: '36px', fontSize: '13px' }} 
                    value={master.reason} 
                    onChange={(e) => handleMasterChange('reason', e.target.value)} 
                    placeholder="Enter reason..."
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', marginBottom: '4px', display: 'block' }}>Return Date</label>
                  <input type="date" className="form-control" style={{ height: '36px', fontSize: '13px' }} value={master.returnDate} onChange={(e) => handleMasterChange('returnDate', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div style={{ border: "1px solid var(--border-light)", borderRadius: "12px", overflow: "hidden", background: "#ffffff" }}>
              <div style={{ padding: "10px 15px", background: "#ffffff", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444" }}>
                  <Package size={16} />
                  <h3 style={{ fontSize: "13px", margin: 0, fontWeight: "700" }}>Return Product</h3>
                </div>
                <button
                  onClick={addItemRow}
                  style={{
                    height: "28px",
                    padding: "0 10px",
                    fontSize: "11px",
                    background: "#ef4444",
                    border: "none",
                    borderRadius: "6px",
                    color: "#ffffff",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.background = "#dc2626"}
                  onMouseOut={(e) => e.target.style.background = "#ef4444"}
                >
                  <Plus size={14} /> Return Product
                </button>
              </div>
              <div className="agro-table-wrapper-simple" style={{ overflowX: "auto" }}>
                <table className="agro-table" style={{ border: "none", width: '100%', minWidth: '1100px' }}>
                  <thead style={{ background: "#ffffff" }}>
                    <tr>
                      <th style={{ minWidth: "220px", fontSize: "10px", letterSpacing: "0.05em", textAlign: "left", paddingLeft: "15px" }}>PRODUCT NAME</th>
                      <th style={{ minWidth: "90px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>BATCH</th>
                      <th style={{ minWidth: "110px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>EXPIRY</th>
                      <th style={{ minWidth: "70px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>SOLD QTY</th>
                      <th style={{ minWidth: "100px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>UNIT</th>
                      <th style={{ minWidth: "110px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>STOCK DECREMENT</th>
                      <th style={{ minWidth: "90px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>SALE RATE</th>
                      <th style={{ minWidth: "100px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>DISC</th>
                      <th style={{ minWidth: "60px", fontSize: "10px", textAlign: "center", letterSpacing: "0.05em" }}>TAX %</th>
                      <th style={{ minWidth: "100px", fontSize: "10px", textAlign: "right", paddingRight: "15px", letterSpacing: "0.05em" }}>TOTAL</th>
                      <th style={{ minWidth: "30px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                         <td style={{ verticalAlign: 'bottom' }}>
                           {item.productId && (
                             <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '4px', fontSize: '10px', fontWeight: '700' }}>
                               <span style={{ color: '#64748b' }}>HSN: <span style={{ color: '#0f172a' }}>{item.hsnCode}</span></span>
                               <span style={{ color: '#64748b' }}>Stock: <span style={{ color: item.currentStock > 0 ? '#16a34a' : '#ef4444' }}>{item.currentStock}</span></span>
                             </div>
                           )}
                           <SearchableSelect
                             options={products}
                             value={item.productId}
                             onChange={(val, data) => handleItemChange(item.id, 'productId', val, data)}
                             placeholder="Select Product"
                             height="36px"
                           />
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           {item.productId && (
                             <div style={{ fontSize: '9px', fontWeight: '800', color: '#0284c7', textAlign: 'center', marginBottom: '2px' }}>
                               Prev: {item.prevBatchNo || 'None'}
                             </div>
                           )}
                           <input type="text" className="form-control" value={item.batchNo} onChange={(e) => handleItemChange(item.id, 'batchNo', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} style={{ height: '36px', fontSize: '13px', textAlign: 'center' }} />
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}><input type="date" className="form-control" value={item.expiryDate} onChange={(e) => handleItemChange(item.id, 'expiryDate', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} style={{ height: '36px', fontSize: '13px', textAlign: 'center' }} /></td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <input
                             ref={el => qtyRefs.current[item.id] = el}
                             type="number" className="form-control" value={item.productId ? (item.quantity ?? '') : ''} disabled={!item.productId}
                             onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                             onKeyDown={(e) => handleEnterNavigation(e, idx)}
                             style={{
                               height: '36px',
                               textAlign: 'center',
                               fontWeight: '700',
                               borderColor: '#e2e8f0',
                               color: 'inherit'
                             }}
                           />
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <select
                             className="form-control"
                             value={item.productId ? item.unit : ''} disabled={!item.productId}
                             onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                             onKeyDown={(e) => handleEnterNavigation(e, idx)}
                             style={{ height: '36px', fontSize: '12px', textAlign: 'center', padding: '0 5px', width: '100%', minWidth: '90px' }}
                           >
                             {!item.productId ? (
                                <option value=""></option>
                              ) : (
                                <option value={item.primaryUnit || item.unit}>{item.primaryUnit || item.unit}</option>
                              )}
                             {item.multiUnits && item.multiUnits.map((mu, i) => (
                               mu.alternative !== (item.primaryUnit || item.unit) && (
                                 <option key={i} value={mu.alternative}>{mu.alternative}</option>
                               )
                             ))}
                           </select>
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                             <input
                               type="number"
                               className="form-control"
                               value={item.productId ? (item.stockIncrement ?? '') : ''} disabled={!item.productId}
                               onChange={(e) => handleItemChange(item.id, 'stockIncrement', e.target.value)}
                               onKeyDown={(e) => handleEnterNavigation(e, idx)}
                               style={{ height: '36px', textAlign: 'center', paddingRight: '40px', fontSize: '13px', fontWeight: '700' }}
                             />
                             {item.productId && item.primaryUnit && (
                               <span style={{
                                 position: 'absolute',
                                 right: '4px',
                                 fontSize: '10px',
                                 fontWeight: '800',
                                 color: 'var(--primary)',
                                 background: '#eff6ff',
                                 padding: '2px 4px',
                                 borderRadius: '4px',
                                 pointerEvents: 'none',
                                 border: '1px solid #dbeafe'
                               }}>
                                 {item.primaryUnit}
                               </span>
                             )}
                           </div>
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}><input type="number" className="form-control" value={item.productId ? (item.rate ?? '') : ''} disabled={!item.productId} onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} style={{ height: '36px', textAlign: 'center', fontWeight: '700' }} /></td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', height: '36px' }}>
                             <input
                               type="number"
                               className="form-control"
                               value={item.discountValue || ''}
                               autoComplete="off"
                               name="rowDiscount"
                               data-lpignore="true"
                               onChange={(e) => handleItemChange(item.id, 'discountValue', e.target.value)}
                               onKeyDown={(e) => handleEnterNavigation(e, idx)}
                               style={{ border: 'none', height: '36px', textAlign: 'center', flex: 1, padding: '0 5px' }}
                             />
                             <select
                               value={item.discountType}
                               onChange={(e) => handleItemChange(item.id, 'discountType', e.target.value)}
                               style={{ border: 'none', borderLeft: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '12px', padding: '0 5px', cursor: 'pointer', outline: 'none' }}
                             >
                               <option value="%">%</option>
                               <option value="Amt">₹</option>
                             </select>
                           </div>
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}><input type="number" className="form-control" value={item.taxPercent || ''} onChange={(e) => handleItemChange(item.id, 'taxPercent', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} style={{ height: '36px', background: '#f8fafc', textAlign: 'center' }} readOnly /></td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: '800', color: 'var(--primary)', paddingRight: '15px' }}>
                             ₹{item.totalAmount.toFixed(2)}
                           </div>
                         </td>
                         <td style={{ verticalAlign: 'bottom', textAlign: 'center' }}>
                           <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <button onClick={() => removeItemRow(item.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                               <Trash2 size={18} />
                             </button>
                           </div>
                         </td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Layout matching NewPurchaseReturn structure */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: '20px' }}>
              
              {/* Refund Info Card */}
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
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '8px 10px', borderRadius: '6px', minWidth: '85px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>Discount</div>
                    <input
                      type="number"
                      style={{ border: 'none', background: 'transparent', padding: '8px 12px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }}
                      value={master.discount === 0 || master.discount === '0' ? '' : master.discount}
                      onChange={(e) => handleMasterChange('discount', e.target.value)}
                      autoComplete="off"
                      name="masterSaleReturnDiscountAmount"
                      data-lpignore="true"
                    />
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', borderRadius: '6px', minWidth: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <select style={{ border: 'none', background: 'transparent', fontWeight: '700', fontSize: '14px', color: '#475569', padding: '8px 5px', outline: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }} value={master.discountType} onChange={(e) => handleMasterChange('discountType', e.target.value)}>
                        <option value="%">%</option>
                        <option value="Amt">₹</option>
                      </select>
                    </div>
                  </div>

                  {/* Cash Refund */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '8px 10px', borderRadius: '6px', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>Refund Cash Amt</div>
                    <input
                      type="number"
                      style={{ border: 'none', background: 'transparent', padding: '8px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }}
                      value={master.cashAmount === 0 || master.cashAmount === '0' ? '' : master.cashAmount}
                      onChange={(e) => handleMasterChange('cashAmount', e.target.value)}
                      autoComplete="off"
                      name="refundCashAmount"
                      data-lpignore="true"
                    />
                  </div>

                  {/* UPI Refund */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '8px 10px', borderRadius: '6px', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>Refund UPI Amt</div>
                    <input
                      type="number"
                      style={{ border: 'none', background: 'transparent', padding: '8px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }}
                      value={master.upiAmount === 0 || master.upiAmount === '0' ? '' : master.upiAmount}
                      onChange={(e) => handleMasterChange('upiAmount', e.target.value)}
                      autoComplete="off"
                      name="refundUpiAmount"
                      data-lpignore="true"
                    />
                  </div>

                  {/* Swipe Refund */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', color: '#475569', fontWeight: '700', fontSize: '12px', padding: '8px 10px', borderRadius: '6px', minWidth: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}>Refund Swipe Amt</div>
                    <input
                      type="number"
                      style={{ border: 'none', background: 'transparent', padding: '8px', flex: 1, outline: 'none', fontSize: '15px', fontWeight: '700', color: '#0f172a', minWidth: 0 }}
                      value={master.swipeAmount === 0 || master.swipeAmount === '0' ? '' : master.swipeAmount}
                      onChange={(e) => handleMasterChange('swipeAmount', e.target.value)}
                      autoComplete="off"
                      name="refundSwipeAmount"
                      data-lpignore="true"
                    />
                  </div>

                  {/* Refund Paid */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '4px', background: '#f0fdf4', gridColumn: 'span 2' }}>
                    <div style={{ background: '#dcfce7', color: '#16a34a', fontWeight: '700', fontSize: '13px', padding: '8px 16px', borderRadius: '6px', minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Refund Paid</div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px 12px', flex: 1, outline: 'none', fontSize: '16px', fontWeight: '700', color: '#16a34a', minWidth: 0 }} value={master.paidAmount} readOnly />
                  </div>

                  {/* Adjust Outstanding */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #fecaca', borderRadius: '10px', padding: '4px', background: '#fff1f2', gridColumn: 'span 2' }}>
                    <div style={{ background: '#fee2e2', color: '#ef4444', fontWeight: '700', fontSize: '13px', padding: '8px 16px', borderRadius: '6px', minWidth: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Adjust Outstanding</div>
                    <input type="number" style={{ border: 'none', background: 'transparent', padding: '8px 12px', flex: 1, outline: 'none', fontSize: '16px', fontWeight: '700', color: '#ef4444', minWidth: 0 }} value={master.dueAmount} readOnly />
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px', display: 'block' }}>Remark / Internal Notes</label>
                  <textarea className="form-control" style={{ height: '80px', background: '#ffffff' }} value={master.notes} onChange={(e) => setMaster({ ...master, notes: e.target.value })} placeholder="Write any additional notes here..." />
                </div>
              </div>

              {/* Summary Card (Green theme) */}
              <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#166534', marginBottom: '15px' }}>Return Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                      <span>Subtotal</span>
                      <span style={{ fontWeight: '600' }}>₹{(parseFloat(master.subtotal) || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                      <span>Tax Amount</span>
                      <span style={{ fontWeight: '600' }}>₹{(parseFloat(master.totalTaxAmount) || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                      <span>Product Discount</span>
                      <span style={{ fontWeight: '600', color: '#ef4444' }}>- ₹{(parseFloat(master.rowDiscountAmount) || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                      <span>Bill Discount</span>
                      <span style={{ fontWeight: '600', color: '#ef4444' }}>- ₹{(parseFloat(master.masterDiscountAmount) || 0).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                      <span>Round Off</span>
                      <span style={{
                        fontWeight: '700',
                        color: (parseFloat(master.roundOff) || 0) < 0 ? '#16a34a' : (parseFloat(master.roundOff) || 0) > 0 ? '#4f46e5' : '#94a3b8'
                      }}>
                        {(parseFloat(master.roundOff) || 0) < 0 ? `- ₹${Math.abs(parseFloat(master.roundOff)).toFixed(2)}` : (parseFloat(master.roundOff) || 0) > 0 ? `+ ₹${parseFloat(master.roundOff).toFixed(2)}` : `₹0.00`}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ margin: "15px 0", borderTop: "1px dashed #bbf7d0" }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: '#166534' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800' }}>Total Refund</span>
                    <span style={{ fontSize: '24px', fontWeight: '900' }}>₹{(parseFloat(master.grandTotal) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                    <button onClick={() => setShowCancelModal(true)} style={{ height: '42px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.background = '#f8fafc'} onMouseOut={(e) => e.target.style.background = '#ffffff'}>
                      Cancel
                    </button>
                    <button onClick={handleSubmit} style={{ height: '42px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#ffffff', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.background = '#dc2626'} onMouseOut={(e) => e.target.style.background = '#ef4444'}>
                      <Save size={18} /> Confirm Refund
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Tax Breakdown Section */}
            <div style={{ marginTop: "20px", marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "13px", margin: 0, fontWeight: "700", color: "#ef4444" }}>
                  Tax Breakdown (CGST & SGST)
                </h3>
                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', border: '1px solid #fecaca' }}>
                  INTRA-STATE SALE
                </span>
              </div>
              <div style={{ border: "1px solid #94a3b8", borderRadius: "8px", overflow: "hidden", background: "#ffffff" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead style={{ background: "#ffffff", borderBottom: "1px solid #94a3b8" }}>
                    <tr>
                      <th rowSpan="2" style={{ padding: "6px 10px", textAlign: "left", borderRight: "1px solid #94a3b8" }}>HSN CODE</th>
                      <th rowSpan="2" style={{ padding: "6px 10px", textAlign: "left", borderRight: "1px solid #94a3b8" }}>Tax Rate</th>
                      <th colSpan="2" style={{ padding: "3px", textAlign: "center", borderRight: "1px solid #94a3b8", borderBottom: "1px solid #94a3b8" }}>CGST</th>
                      <th colSpan="2" style={{ padding: "3px", textAlign: "center", borderRight: "1px solid #94a3b8", borderBottom: "1px solid #94a3b8" }}>SGST</th>
                      <th rowSpan="2" style={{ padding: "6px 10px", textAlign: "right" }}>Total Tax</th>
                    </tr>
                    <tr>
                      <th style={{ padding: "3px", textAlign: "center", borderRight: "1px solid #94a3b8", fontWeight: "600" }}>Rate</th>
                      <th style={{ padding: "3px", textAlign: "center", borderRight: "1px solid #94a3b8", fontWeight: "600" }}>Amount</th>
                      <th style={{ padding: "3px", textAlign: "center", borderRight: "1px solid #94a3b8", fontWeight: "600" }}>Rate</th>
                      <th style={{ padding: "3px", textAlign: "center", borderRight: "1px solid #94a3b8", fontWeight: "600" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(taxBreakdown).length > 0 ? (
                      Object.values(taxBreakdown).map((item, i, arr) => (
                        <tr key={i} style={{ borderBottom: i === arr.length - 1 ? "none" : "1px solid #94a3b8" }}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #94a3b8" }}>{item.hsn}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #94a3b8" }}>{item.taxRate}%</td>
                          <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>{(item.taxRate / 2).toFixed(2)}%</td>
                          <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>₹{item.cgstAmount.toFixed(2)}</td>
                          <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>{(item.taxRate / 2).toFixed(2)}%</td>
                          <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>₹{item.sgstAmount.toFixed(2)}</td>
                          <td style={{ padding: "6px 10px", textAlign: "right", fontWeight: "700" }}>₹{item.totalTax.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ padding: "10px", textAlign: "center", color: "#64748b", fontStyle: "italic" }}>Add products to see tax breakdown</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot style={{ background: "#f1f5f9", fontWeight: "800", borderTop: "1px solid #94a3b8" }}>
                    <tr>
                      <td style={{ padding: "6px 10px", borderRight: "1px solid #94a3b8" }}>Total</td>
                      <td style={{ borderRight: "1px solid #94a3b8" }}></td>
                      <td style={{ borderRight: "1px solid #94a3b8" }}></td>
                      <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>₹{(parseFloat(master.totalTaxAmount || 0) / 2).toFixed(2)}</td>
                      <td style={{ borderRight: "1px solid #94a3b8" }}></td>
                      <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>₹{(parseFloat(master.totalTaxAmount || 0) / 2).toFixed(2)}</td>
                      <td style={{ padding: "6px 10px", textAlign: "right" }}>₹{parseFloat(master.totalTaxAmount || 0).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>

      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '30px',
            width: '90%',
            maxWidth: '440px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>
              🛑 Confirm Cancel?
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Are you sure you want to cancel? Any unsaved changes will be lost.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                onMouseOut={(e) => e.target.style.background = '#ffffff'}
              >
                Keep Editing
              </button>
              <button 
                onClick={() => {
                  setShowCancelModal(false);
                  navigate('/sales/returns');
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#dc2626'}
                onMouseOut={(e) => e.target.style.background = '#ef4444'}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewSaleReturn;
