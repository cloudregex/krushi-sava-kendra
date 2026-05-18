import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Calendar, User, CreditCard, IndianRupee, Package, Search, Info, Printer } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const newRow = () => ({
  id: Date.now() + Math.random(),
  productId: '',
  productName: '',
  primaryUnit: '',
  hsnCode: '',
  batchNo: '',
  expiryDate: '',
  currentStock: 0,
  quantity: '',
  freeQuantity: '',
  unit: '',
  saleRate: '',
  discount: 0,
  discountType: 'percent',
  taxPercent: 0,
  taxAmount: 0,
  amount: 0,
  stockIncrement: '',
  conversionFactor: 1
});

const SaleEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});
  const exceedsTimeoutRefs = useRef({});

  const [master, setMaster] = useState({
    invoiceNo: '',
    customerId: '',
    billDate: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    discountType: 'percent',
    grandTotal: 0,
    cashPaid: '',
    upiPaid: '',
    swipePaid: '',
    paidAmount: 0,
    pendingAmount: 0,
    totalDiscount: 0,
    roundOff: 0,
    notes: '',
    customerBalance: 0,
    taxBreakdown: []
  });

  const [children, setChildren] = useState([newRow()]);
  const rowToFocus = useRef(null);

  useEffect(() => {
    return () => {
      Object.values(exceedsTimeoutRefs.current).forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custData, prodData, unitData] = await Promise.all([
          ApiService.getAll('customers'),
          ApiService.getAll('products'),
          ApiService.getAll('units')
        ]);
        console.log("Fetched Customers:", custData);
        console.log("Fetched Products:", prodData);
        setCustomers(custData);
        // Only show saleable products
        const saleable = prodData.filter(p => p.isSaleable);
        console.log("Saleable Products:", saleable);
        setProducts(saleable);
        setUnits(unitData);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const calculateTotals = (rows) => {
    let subtotal = 0, totalTax = 0, totalRowDiscount = 0;

    rows.forEach(child => {
      const qty = parseFloat(child.quantity) || 0;
      const rate = parseFloat(child.saleRate) || 0;
      const disc = parseFloat(child.actualDiscount) || 0;
      const taxP = parseFloat(child.taxPercent) || 0;

      const rowSub = qty * rate;
      const rowTax = ((rowSub - disc) * taxP) / 100;

      subtotal += rowSub;
      totalRowDiscount += disc;
      totalTax += rowTax;
    });

    setMaster(prev => {
      // Use existing values from prev state to avoid flickering/overwriting during typing
      const cPaid = parseFloat(prev.cashPaid) || 0;
      const uPaid = parseFloat(prev.upiPaid) || 0;
      const sPaid = parseFloat(prev.swipePaid) || 0;

      const mDiscVal = parseFloat(prev.discountAmount) || 0;
      let mDisc = 0;
      if (prev.discountType === 'percent') {
        mDisc = ((subtotal + totalTax - totalRowDiscount) * mDiscVal) / 100;
      } else {
        mDisc = mDiscVal;
      }

      const totalBillDiscount = totalRowDiscount + mDisc;
      const rawGrandTotal = Math.max(0, subtotal + totalTax - totalBillDiscount);
      const finalGrandTotal = Math.round(rawGrandTotal);
      const rOff = parseFloat((finalGrandTotal - rawGrandTotal).toFixed(2));
      const totalPaid = cPaid + uPaid + sPaid;

      // Tax Breakdown
      const hsnMap = {};
      rows.forEach(child => {
        if (!child.productId) return;
        const hsn = child.hsnCode || 'N/A';
        const taxP = parseFloat(child.taxPercent) || 0;
        const rowGross = (parseFloat(child.quantity) || 0) * (parseFloat(child.saleRate) || 0);
        const rowDisc = parseFloat(child.actualDiscount) || 0;
        const taxableVal = rowGross - rowDisc;
        const rowTax = (taxableVal * taxP) / 100;

        if (!hsnMap[hsn]) {
          hsnMap[hsn] = { hsn, taxRate: taxP, cgstRate: taxP / 2, sgstRate: taxP / 2, cgstAmount: rowTax / 2, sgstAmount: rowTax / 2, totalTax: rowTax };
        } else {
          hsnMap[hsn].cgstAmount += rowTax / 2;
          hsnMap[hsn].sgstAmount += rowTax / 2;
          hsnMap[hsn].totalTax += rowTax;
        }
      });

      return {
        ...prev,
        subtotal: subtotal,
        taxAmount: totalTax,
        rowDiscountAmount: totalRowDiscount,
        masterDiscountAmount: mDisc,
        totalDiscount: totalBillDiscount,
        grandTotal: finalGrandTotal,
        roundOff: rOff,
        paidAmount: parseFloat(totalPaid.toFixed(2)),
        pendingAmount: parseFloat(Math.max(0, finalGrandTotal - totalPaid).toFixed(2)),
        taxBreakdown: Object.values(hsnMap)
      };
    });
  };

  const handleChildChange = (id, field, value, extraData) => {
    const updated = children.map(child => {
      if (child.id !== id) return child;

      let u = { ...child, [field]: value };

      if (field === 'productId') {
        if (extraData) {
          // Use String comparison to prevent unnecessary resets due to type mismatch
          if (String(child.productId) !== String(value)) {
            u.productName = extraData.name || '';
            u.hsnCode = extraData.hsnCode || '';
            u.currentStock = extraData.currentStock || 0;
            u.unit = extraData.unit || '';
            u.primaryUnit = extraData.unit || '';
            u.taxPercent = parseFloat(extraData.tax) || 0;
            u.saleRate = (extraData.saleRate !== undefined && extraData.saleRate !== null && extraData.saleRate !== '') ? extraData.saleRate : (extraData.multiUnits && extraData.multiUnits.length > 0 ? extraData.multiUnits[0].amount : '');
            u.multiUnits = extraData.multiUnits || [];
            u.conversionFactor = 1;
            u.batchNo = '';
            u.expiryDate = '';
            u.quantity = 1;
            u.freeQuantity = 0;
            u.discount = 0;
            // Reset edited flags as this is a new product selection
            u.saleRateEdited = false;
            u.batchNoEdited = false;
            u.expiryDateEdited = false;

            // Trigger batch fetch only if product actually changed
            if (value) {
              ApiService.getById('products', `${value}/latest-batch`).then(res => {
                if (res) {
                    setChildren(prevRows => prevRows.map(row => {
                      if (row.id === id) {
                         const prod = products.find(p => String(p.id) === String(row.productId));
                         let defaultRate = '';
                         if (prod) {
                           defaultRate = (prod.saleRate !== undefined && prod.saleRate !== null && prod.saleRate !== '') 
                             ? prod.saleRate 
                             : (prod.multiUnits && prod.multiUnits.length > 0 ? prod.multiUnits[0].amount : '');
                         }

                         const isRateEdited = row.saleRateEdited || (row.saleRate !== '' && String(row.saleRate) !== String(defaultRate));

                         const newBatch = row.batchNoEdited ? row.batchNo : '';
                         const newExpiry = row.expiryDateEdited ? row.expiryDate : (res.expiryDate ? res.expiryDate.split('T')[0] : row.expiryDate);
                         const newRate = isRateEdited ? row.saleRate : (res.saleRate || row.saleRate);

                       const qty = parseFloat(row.quantity) || 0;
                       const rate = parseFloat(newRate) || 0;
                       const rowSub = qty * rate;
                       let actualDisc = 0;
                       const dVal = parseFloat(row.discount) || 0;
                       if (row.discountType === 'percent') {
                         actualDisc = (rowSub * dVal) / 100;
                       } else {
                         actualDisc = dVal;
                       }
                       const taxP = parseFloat(row.taxPercent) || 0;
                       const rowTax = ((rowSub - actualDisc) * taxP) / 100;

                       return {
                         ...row,
                         batchNo: newBatch,
                         prevBatchNo: res.batchNo || '',
                         expiryDate: newExpiry,
                         saleRate: newRate,
                         amount: rowSub,
                         taxAmount: rowTax,
                         actualDiscount: actualDisc
                       };
                     }
                     return row;
                   }));
                }
              }).catch(err => console.log("Batch fetch error:", err));
            }
          }
        } else {
          const fresh = newRow();
          u = { ...fresh, id: u.id };
        }
      }

      if (field === 'batchNo') u.batchNoEdited = true;
      if (field === 'expiryDate') u.expiryDateEdited = true;
      if (field === 'saleRate') u.saleRateEdited = true;

      if (field === 'unit') {
        const prod = products.find(p => String(p.id) === String(u.productId));
        const mu = u.multiUnits.find(m => m.alternative === value);
        u.conversionFactor = mu ? (parseFloat(mu.conversion) || 1) : 1;
        if (value === u.primaryUnit) {
          if (prod) {
            u.saleRate = (prod.saleRate !== undefined && prod.saleRate !== null && prod.saleRate !== '') ? prod.saleRate : '';
          }
        } else if (mu && mu.amount !== undefined && mu.amount !== null && mu.amount !== '') {
          u.saleRate = mu.amount;
        }
      }

      // Sync Quantity if Stock Increment is changed manually
      if (field === 'stockIncrement') {
        const factor = parseFloat(u.conversionFactor) || 1;
        const incVal = parseFloat(value) || 0;
        const fQty = parseFloat(u.freeQuantity) || 0;
        // Formula: stockIncrement = (qty + freeQty) / factor
        // So: qty = (stockIncrement * factor) - freeQty
        u.quantity = Math.max(0, (incVal * factor) - fQty);
      }

      const qty = parseFloat(u.quantity) || 0;
      const freeQty = parseFloat(u.freeQuantity) || 0;
      const rate = parseFloat(u.saleRate) || 0;
      const taxP = parseFloat(u.taxPercent) || 0;
      const factor = parseFloat(u.conversionFactor) || 1;

      // Recalculate Stock Increment if Quantity/Unit changes
      if (['quantity', 'freeQuantity', 'unit', 'productId'].includes(field)) {
        u.stockIncrement = (qty + freeQty) / factor;
      }

      const rowSub = qty * rate;
      let actualDisc = 0;
      const dVal = parseFloat(u.discount) || 0;
      if (u.discountType === 'percent') {
        actualDisc = (rowSub * dVal) / 100;
      } else {
        actualDisc = dVal;
      }

      const rowTax = ((rowSub - actualDisc) * taxP) / 100;

      u.amount = qty * rate;
      u.taxAmount = rowTax;
      u.actualDiscount = actualDisc;
      return u;
    });

    setChildren(updated);
    // Removed direct calculateTotals call to prevent flickering

    // Exceeds stock auto-reset logic
    if (['quantity', 'stockIncrement', 'productId'].includes(field)) {
      const targetRow = updated.find(r => r.id === id);
      if (targetRow && targetRow.productId) {
        const qty = parseFloat(targetRow.quantity) || 0;
        const currentStock = parseFloat(targetRow.currentStock) || 0;

        if (exceedsTimeoutRefs.current[id]) {
          clearTimeout(exceedsTimeoutRefs.current[id]);
          delete exceedsTimeoutRefs.current[id];
        }

        if (qty > currentStock) {
          exceedsTimeoutRefs.current[id] = setTimeout(() => {
            setChildren(prevRows => prevRows.map(row => {
              if (row.id === id && (parseFloat(row.quantity) || 0) > (parseFloat(row.currentStock) || 0)) {
                let u = { ...row, quantity: row.currentStock };
                const q = parseFloat(u.currentStock) || 0;
                const freeQty = parseFloat(u.freeQuantity) || 0;
                const rate = parseFloat(u.saleRate) || 0;
                const taxP = parseFloat(u.taxPercent) || 0;
                const factor = parseFloat(u.conversionFactor) || 1;

                u.stockIncrement = (q + freeQty) / factor;
                const rowSub = q * rate;
                let actualDisc = 0;
                const dVal = parseFloat(u.discount) || 0;
                if (u.discountType === 'percent') {
                  actualDisc = (rowSub * dVal) / 100;
                } else {
                  actualDisc = dVal;
                }
                const rowTax = ((rowSub - actualDisc) * taxP) / 100;
                u.amount = q * rate;
                u.taxAmount = rowTax;
                u.actualDiscount = actualDisc;
                return u;
              }
              return row;
            }));
            delete exceedsTimeoutRefs.current[id];
          }, 2500);
        }
      }
    }

    if (field === 'productId' && value) {
      setTimeout(() => qtyRefs.current[id]?.focus(), 50);
    }
    return true;
  };

  const handleMasterChange = (field, value) => {
    // 1. Update the field immediately and accurately
    setMaster(prev => ({ ...prev, [field]: value }));

    // 2. Only if customer changes, fetch external data
    if (field === 'customerId') {
      if (!value) {
        setMaster(prev => ({ ...prev, customerBalance: 0, invoiceNo: '', billDate: '' }));
        return;
      }

      const customer = customers.find(c => String(c.id) === String(value));
      ApiService.getAll('sales/next-invoice').then(invData => {
        // Use functional update to avoid overwriting typed payment values
        setMaster(prev => ({
          ...prev,
          customerBalance: customer?.balance || 0,
          invoiceNo: invData.invoiceNo || '',
          billDate: new Date().toISOString().split('T')[0]
        }));
      }).catch(err => console.error("Invoice fetch error:", err));
    }
  };

  useEffect(() => {
    calculateTotals(children);
  }, [
    children,
    master.cashPaid,
    master.upiPaid,
    master.swipePaid,
    master.discountAmount,
    master.discountType,
    master.customerId
  ]);

  const addChildRow = () => {
    const r = newRow();
    setChildren([...children, r]);
    rowToFocus.current = r.id;
  };

  const removeChildRow = (id) => {
    if (exceedsTimeoutRefs.current[id]) {
      clearTimeout(exceedsTimeoutRefs.current[id]);
      delete exceedsTimeoutRefs.current[id];
    }
    if (children.length > 1) {
      const updated = children.filter(c => c.id !== id);
      setChildren(updated);
      calculateTotals(updated);
    } else {
      // If it's the last row, just clear it with a fresh one
      const fresh = [newRow()];
      setChildren(fresh);
      calculateTotals(fresh);
    }
  };

  const handleSaveSale = async (shouldPrint = false) => {
    if (!master.customerId) return toast.error("Please select a customer");
    const validItems = children.filter(c => c.productId && c.quantity > 0);
    if (validItems.length === 0) return toast.error("Please add at least one product");

    try {
      const payload = {
        invoiceNo: master.invoiceNo,
        customerId: master.customerId,
        billDate: master.billDate,
        subtotal: master.subtotal,
        taxAmount: master.taxAmount,
        discountAmount: master.totalDiscount,
        grandTotal: master.grandTotal,
        paidAmount: master.paidAmount,
        balanceAmount: master.pendingAmount,
        paymentMode: {
          cash: parseFloat(master.cashPaid) || 0,
          upi: parseFloat(master.upiPaid) || 0,
          swipe: parseFloat(master.swipePaid) || 0
        },
        notes: master.notes,
        items: validItems.map(c => ({
          productId: c.productId,
          batchNo: c.batchNo,
          expiryDate: c.expiryDate,
          quantity: parseFloat(c.quantity),
          freeQuantity: parseFloat(c.freeQuantity) || 0,
          unit: c.unit,
          rate: parseFloat(c.saleRate),
          discount: parseFloat(c.actualDiscount) || 0,
          taxPercent: parseFloat(c.taxPercent) || 0,
          taxAmount: parseFloat(c.taxAmount) || 0,
          totalAmount: parseFloat(c.amount),
          conversionFactor: parseFloat(c.conversionFactor) || 1,
          stockIncrement: parseFloat(c.stockIncrement) || 0
        }))
      };

      const response = await ApiService.add('sales', payload);

      if (response && response.sale) {
        toast.success("Sale Saved Successfully!");
        navigate('/sales/bills');
      }
    } catch (error) {
      console.error("Save Sale Error:", error);
      toast.error(error.response?.data?.message || "Failed to save sale");
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this sale? Any unsaved changes will be lost.")) {
      navigate('/sales/bills');
    }
  };

  return (
    <div className="agro-container">
      <div>
        <div
          className="agro-header-compact"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            margin: "-5px -5px 20px -5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 10px",
            borderBottom: "1px solid var(--border-light)",
            background: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", marginBottom: "1px" }}>
              Professional Sale Bill
            </h2>
            <p style={{ fontSize: "12px", margin: 0 }}>
              Krushi Seva Kendra Billing System
            </p>
          </div>
          <button
            className="btn-agro btn-outline"
            onClick={() => navigate('/sales/bills')}
            style={{ height: "34px", padding: "0 12px", fontSize: "12px" }}
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: "15px 10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={{ padding: "12px", background: "#ffffff", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px", color: "var(--primary)" }}>
                <User size={16} />
                <h3 style={{ fontSize: "13px", margin: 0, fontWeight: "700" }}>Customer Details</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "15px" }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px", display: "block" }}>CUSTOMER SEARCH</label>
                  <SearchableSelect
                    options={customers}
                    value={master.customerId}
                    onChange={(val) => handleMasterChange('customerId', val)}
                    placeholder="Search Customer..."
                    height="36px"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px", display: "block" }}>BALANCE STATUS</label>
                  <div style={{
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 15px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '800',
                    background: !master.customerId ? '#f1f5f9' : (master.customerBalance > 0 ? '#fee2e2' : '#dcfce7'),
                    color: !master.customerId ? '#94a3b8' : (master.customerBalance > 0 ? '#ef4444' : '#16a34a'),
                    border: `1px solid ${!master.customerId ? '#e2e8f0' : (master.customerBalance > 0 ? '#fecaca' : '#bbf7d0')}`
                  }}>
                    {!master.customerId ? 'Select Customer' : (master.customerBalance > 0 ? `Pending: ₹${master.customerBalance}` : master.customerBalance < 0 ? `Advance: ₹${Math.abs(master.customerBalance)}` : 'No Dues')}
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", marginBottom: "4px", display: "block" }}>SALE DATE</label>
                  <input type="date" className="form-control" value={master.billDate} onChange={(e) => handleMasterChange('billDate', e.target.value)} style={{ height: '36px', fontSize: '13px' }} />
                </div>
              </div>
            </div>

            <div style={{ border: "1px solid var(--border-light)", borderRadius: "12px", overflow: "hidden", background: "#ffffff" }}>
              <div style={{ padding: "10px 15px", background: "#ffffff", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--primary)" }}>
                  <Package size={16} />
                  <h3 style={{ fontSize: "13px", margin: 0, fontWeight: "700" }}>Products</h3>
                </div>
                <button className="btn-agro btn-primary" onClick={addChildRow} style={{ height: "28px", padding: "0 10px", fontSize: "11px", background: "var(--primary)" }}>
                  <Plus size={14} /> Add Product
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
                    {children.map((child, idx) => (
                      <tr key={child.id}>
                         <td style={{ verticalAlign: 'bottom' }}>
                           {child.productId && (
                             <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '4px', fontSize: '10px', fontWeight: '700' }}>
                               <span style={{ color: '#64748b' }}>HSN: <span style={{ color: '#0f172a' }}>{child.hsnCode}</span></span>
                               <span style={{ color: '#64748b' }}>Stock: <span style={{ color: child.currentStock > 0 ? '#16a34a' : '#ef4444' }}>{child.currentStock}</span></span>
                             </div>
                           )}
                           <SearchableSelect
                             options={products}
                             value={child.productId}
                             onChange={(val, data) => handleChildChange(child.id, 'productId', val, data)}
                             placeholder="Select Product"
                             height="36px"
                           />
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           {child.productId && (
                             <div style={{ fontSize: '9px', fontWeight: '800', color: '#0284c7', textAlign: 'center', marginBottom: '2px' }}>
                               Prev: {child.prevBatchNo || 'None'}
                             </div>
                           )}
                           <input type="text" className="form-control" value={child.batchNo} onChange={(e) => handleChildChange(child.id, 'batchNo', e.target.value)} style={{ height: '36px', fontSize: '13px', textAlign: 'center' }} />
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}><input type="date" className="form-control" value={child.expiryDate} onChange={(e) => handleChildChange(child.id, 'expiryDate', e.target.value)} style={{ height: '36px', fontSize: '13px', textAlign: 'center' }} /></td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <input
                             ref={el => qtyRefs.current[child.id] = el}
                             type="number" className="form-control" value={child.quantity ?? ''}
                             onChange={(e) => handleChildChange(child.id, 'quantity', e.target.value)}
                             style={{
                               height: '36px',
                               textAlign: 'center',
                               fontWeight: '700',
                               borderColor: (child.productId && child.quantity > child.currentStock) ? '#ef4444' : '#e2e8f0',
                               color: (child.productId && child.quantity > child.currentStock) ? '#ef4444' : 'inherit'
                             }}
                           />
                           {child.productId && child.quantity > child.currentStock && (
                             <div style={{ color: '#ef4444', fontSize: '10px', fontWeight: '800', marginTop: '2px' }}>EXCEEDS STOCK!</div>
                           )}
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <select
                             className="form-control"
                             value={child.unit}
                             onChange={(e) => handleChildChange(child.id, 'unit', e.target.value)}
                             style={{ height: '36px', fontSize: '12px', textAlign: 'center', padding: '0 5px', width: '100%', minWidth: '90px' }}
                           >
                             <option value={child.primaryUnit || child.unit}>{child.primaryUnit || child.unit}</option>
                             {child.multiUnits && child.multiUnits.map((mu, i) => (
                               mu.alternative !== (child.primaryUnit || child.unit) && (
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
                               value={child.stockIncrement ?? ''}
                               onChange={(e) => handleChildChange(child.id, 'stockIncrement', e.target.value)}
                               style={{ height: '36px', textAlign: 'center', paddingRight: '40px', fontSize: '13px', fontWeight: '700' }}
                             />
                             {child.primaryUnit && (
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
                                 {child.primaryUnit}
                               </span>
                             )}
                           </div>
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}><input type="number" className="form-control" value={child.saleRate ?? ''} onChange={(e) => handleChildChange(child.id, 'saleRate', e.target.value)} style={{ height: '36px', textAlign: 'center', fontWeight: '700' }} /></td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', height: '36px' }}>
                             <input
                               type="number"
                               className="form-control"
                               value={child.discount || ''}
                               onChange={(e) => handleChildChange(child.id, 'discount', e.target.value)}
                               style={{ border: 'none', height: '36px', textAlign: 'center', flex: 1, padding: '0 5px' }}
                             />
                             <select
                               value={child.discountType}
                               onChange={(e) => handleChildChange(child.id, 'discountType', e.target.value)}
                               style={{ border: 'none', borderLeft: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '12px', padding: '0 5px', cursor: 'pointer', outline: 'none' }}
                             >
                               <option value="percent">%</option>
                               <option value="amount">₹</option>
                             </select>
                           </div>
                         </td>
                         <td style={{ verticalAlign: 'bottom' }}><input type="number" className="form-control" value={child.taxPercent || ''} onChange={(e) => handleChildChange(child.id, 'taxPercent', e.target.value)} style={{ height: '36px', background: '#f8fafc', textAlign: 'center' }} readOnly /></td>
                         <td style={{ verticalAlign: 'bottom' }}>
                           <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: '800', color: 'var(--primary)', paddingRight: '15px' }}>
                             ₹{child.amount.toFixed(2)}
                           </div>
                         </td>
                         <td style={{ verticalAlign: 'bottom', textAlign: 'center' }}>
                           <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <button onClick={() => removeChildRow(child.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
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

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)", gap: "20px", marginTop: "20px" }}>
              <div style={{ padding: "20px", background: "#ffffff", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ background: "#eff6ff", padding: "6px", borderRadius: "8px" }}>
                    <CreditCard size={18} color="#2563eb" />
                  </div>
                  <h3 style={{ fontSize: "14px", margin: "0", fontWeight: "800", color: "#1e293b", letterSpacing: "0.05em" }}>PAYMENT INFO</h3>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "15px" }}>
                  {/* Row 1: 4 Fields */}
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", background: "#ffffff" }}>
                    <div style={{ background: "#f1f5f9", color: "#475569", fontWeight: "700", fontSize: "12px", padding: "8px 10px", borderRadius: "6px", minWidth: "85px", display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>Discount</div>
                    <input
                      type="number"
                      style={{ border: "none", background: "transparent", padding: "8px 12px", flex: 1, outline: "none", fontSize: "15px", fontWeight: "700", color: "#0f172a", minWidth: 0 }}
                      value={master.discountAmount === 0 || master.discountAmount === '0' ? '' : master.discountAmount}
                      onChange={(e) => handleMasterChange("discountAmount", e.target.value)}
                    />
                    <div style={{ background: "#f1f5f9", color: "#475569", fontWeight: "700", fontSize: "12px", borderRadius: "6px", minWidth: "50px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      <select style={{ border: "none", background: "transparent", fontWeight: "700", fontSize: "14px", color: "#475569", padding: "8px 5px", outline: "none", cursor: "pointer", width: "100%", textAlign: "center" }} value={master.discountType} onChange={(e) => handleMasterChange("discountType", e.target.value)}>
                        <option value="percent">%</option>
                        <option value="amount">₹</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", background: "#ffffff" }}>
                    <div style={{ background: "#f1f5f9", color: "#475569", fontWeight: "700", fontSize: "12px", padding: "8px 10px", borderRadius: "6px", minWidth: "85px", display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>Cash Amt</div>
                    <input type="number" style={{ border: "none", background: "transparent", padding: "8px", flex: 1, outline: "none", fontSize: "15px", fontWeight: "700", color: "#0f172a", minWidth: 0 }} value={master.cashPaid === 0 || master.cashPaid === '0' ? '' : master.cashPaid} onChange={(e) => handleMasterChange("cashPaid", e.target.value)} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", background: "#ffffff" }}>
                    <div style={{ background: "#f1f5f9", color: "#475569", fontWeight: "700", fontSize: "12px", padding: "8px 10px", borderRadius: "6px", minWidth: "85px", display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>UPI Amt</div>
                    <input type="number" style={{ border: "none", background: "transparent", padding: "8px", flex: 1, outline: "none", fontSize: "15px", fontWeight: "700", color: "#0f172a", minWidth: 0 }} value={master.upiPaid === 0 || master.upiPaid === '0' ? '' : master.upiPaid} onChange={(e) => handleMasterChange("upiPaid", e.target.value)} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "4px", background: "#ffffff" }}>
                    <div style={{ background: "#f1f5f9", color: "#475569", fontWeight: "700", fontSize: "12px", padding: "8px 10px", borderRadius: "6px", minWidth: "85px", display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap" }}>Swipe Amt</div>
                    <input type="number" style={{ border: "none", background: "transparent", padding: "8px", flex: 1, outline: "none", fontSize: "15px", fontWeight: "700", color: "#0f172a", minWidth: 0 }} value={master.swipePaid === 0 || master.swipePaid === '0' ? '' : master.swipePaid} onChange={(e) => handleMasterChange("swipePaid", e.target.value)} />
                  </div>

                  {/* Row 2: 2 Fields */}
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "4px", background: "#f0fdf4", gridColumn: "span 2" }}>
                    <div style={{ background: "#dcfce7", color: "#16a34a", fontWeight: "700", fontSize: "13px", padding: "8px 16px", borderRadius: "6px", minWidth: "110px", display: "flex", alignItems: "center", justifyContent: "center" }}>Paid</div>
                    <input type="number" style={{ border: "none", background: "transparent", padding: "8px 12px", flex: 1, outline: "none", fontSize: "16px", fontWeight: "700", color: "#16a34a", minWidth: 0 }} value={master.paidAmount} readOnly />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #fecaca", borderRadius: "10px", padding: "4px", background: "#fff1f2", gridColumn: "span 2" }}>
                    <div style={{ background: "#fee2e2", color: "#ef4444", fontWeight: "700", fontSize: "13px", padding: "8px 16px", borderRadius: "6px", minWidth: "110px", display: "flex", alignItems: "center", justifyContent: "center" }}>Pending</div>
                    <input type="number" style={{ border: "none", background: "transparent", padding: "8px 12px", flex: 1, outline: "none", fontSize: "16px", fontWeight: "700", color: "#ef4444", minWidth: 0 }} value={master.pendingAmount} readOnly />
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "5px", display: "block" }}>Remark / Internal Notes</label>
                  <textarea className="form-control" style={{ height: "80px", background: "#ffffff", borderRadius: "10px", resize: "none" }} value={master.notes} onChange={(e) => handleMasterChange("notes", e.target.value)} placeholder="Write any additional notes here..." />
                </div>
              </div>

              <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "12px", border: "1px solid #dcfce7" }}>
                <h3 style={{ fontSize: "14px", margin: "0 0 15px 0", fontWeight: "800", color: "#16a34a" }}>Bill Summary</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#334155" }}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: "600" }}>₹{(parseFloat(master.subtotal) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#334155" }}>
                    <span>Tax Amount</span>
                    <span style={{ fontWeight: "600" }}>₹{(parseFloat(master.taxAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#334155" }}>
                    <span>Product Discount</span>
                    <span style={{ fontWeight: "600", color: "#ef4444" }}>- ₹{(parseFloat(master.rowDiscountAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#334155" }}>
                    <span>Bill Discount</span>
                    <span style={{ fontWeight: "600", color: "#ef4444" }}>- ₹{(parseFloat(master.masterDiscountAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#334155" }}>
                    <span>Round Off</span>
                    <span style={{
                      fontWeight: "700",
                      color: (master.roundOff || 0) < 0 ? "#16a34a" : (master.roundOff || 0) > 0 ? "#4f46e5" : "#94a3b8"
                    }}>
                      {(master.roundOff || 0) < 0 ? `- ₹${Math.abs(master.roundOff).toFixed(2)}` : (master.roundOff || 0) > 0 ? `+ ₹${master.roundOff.toFixed(2)}` : `₹0.00`}
                    </span>
                  </div>
                  <div style={{ margin: "15px 0", borderTop: "1px dashed #bbf7d0" }}></div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#166534" }}>
                    <span style={{ fontSize: "15px", fontWeight: "800" }}>Grand Total</span>
                    <span style={{ fontSize: "24px", fontWeight: "900" }}>₹{(parseFloat(master.grandTotal) || 0).toFixed(2)}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginTop: "20px" }}>
                    <button onClick={handleCancel} style={{ height: "42px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#ffffff", color: "#475569", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#f8fafc"} onMouseOut={(e) => e.target.style.background = "#ffffff"}>
                      Cancel
                    </button>
                    <button onClick={() => handleSaveSale(false)} disabled={children.some(c => c.productId && c.quantity > c.currentStock)} style={{ height: "42px", borderRadius: "8px", border: "none", background: "#16a34a", color: "#ffffff", fontWeight: "700", cursor: children.some(c => c.productId && c.quantity > c.currentStock) ? "not-allowed" : "pointer", opacity: children.some(c => c.productId && c.quantity > c.currentStock) ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s" }} onMouseOver={(e) => { if (!e.target.disabled) e.target.style.background = "#15803d" }} onMouseOut={(e) => { if (!e.target.disabled) e.target.style.background = "#16a34a" }}>
                      <Save size={18} /> Save Sale
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 5️⃣ Tax Breakdown Section (Professional GST Table) */}
            {/* 5️⃣ Tax Breakdown Section (Professional GST Table) */}
            <div style={{ marginTop: "20px", marginBottom: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "13px", margin: 0, fontWeight: "700", color: "var(--primary)" }}>
                  Tax Breakdown (CGST & SGST)
                </h3>
                <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', border: '1px solid #bbf7d0' }}>
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
                    {master.taxBreakdown.length > 0 ? (
                      master.taxBreakdown.map((item, i, arr) => (
                        <tr key={i} style={{ borderBottom: i === arr.length - 1 ? "none" : "1px solid #94a3b8" }}>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #94a3b8" }}>{item.hsn}</td>
                          <td style={{ padding: "6px 10px", borderRight: "1px solid #94a3b8" }}>{item.taxRate}%</td>
                          <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>{item.cgstRate.toFixed(2)}%</td>
                          <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>₹{item.cgstAmount.toFixed(2)}</td>
                          <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>{item.sgstRate.toFixed(2)}%</td>
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
                      <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>₹{(parseFloat(master.taxAmount || 0) / 2).toFixed(2)}</td>
                      <td style={{ borderRight: "1px solid #94a3b8" }}></td>
                      <td style={{ padding: "6px", textAlign: "center", borderRight: "1px solid #94a3b8" }}>₹{(parseFloat(master.taxAmount || 0) / 2).toFixed(2)}</td>
                      <td style={{ padding: "6px 10px", textAlign: "right" }}>₹{parseFloat(master.taxAmount || 0).toFixed(2)}</td>
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

export default SaleEntry;
