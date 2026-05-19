import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Calendar, User, CreditCard, IndianRupee, Package, Search, Info, Printer } from 'lucide-react';
import { ApiService } from '../mastermodel/services/ApiService';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';
import { QuickCustomerModal, QuickProductModal } from './QuickCreateModals';
import AgroDatePicker from './AgroDatePicker';

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

import { useParams } from 'react-router-dom';

const EditSaleBill = () => {
  const { id } = useParams();
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
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeChildRowId, setActiveChildRowId] = useState(null);

  const handleQuickCustomerSave = (newCustomer) => {
    setCustomers(prev => [...prev, newCustomer]);
    setMaster(prev => ({
      ...prev,
      customerId: newCustomer.id,
      customerBalance: newCustomer.balance || 0
    }));
  };

  const handleQuickProductSave = (newProduct) => {
    setProducts(prev => [...prev, newProduct]);
    if (activeChildRowId) {
      handleChildChange(activeChildRowId, 'productId', newProduct.id, newProduct);
      setActiveChildRowId(null);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(exceedsTimeoutRefs.current).forEach(t => clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("🔄 FETCHING EDIT DATA FOR ID:", id);
        const [custData, prodData, unitData, saleData] = await Promise.all([
          ApiService.getAll('customers'),
          ApiService.getAll('products'),
          ApiService.getAll('units'),
          ApiService.getById('sales', id)
        ]);

        console.log("✅ Customers Found:", custData?.length);
        console.log("✅ Products Found:", prodData?.length);
        console.log("✅ Sale Data Received:", saleData);

        setCustomers(custData || []);
        const saleable = (prodData || []).filter(p => p.isSaleable || p.isActive);
        setProducts(saleable);
        setUnits(unitData || []);

        if (saleData) {
          const sale = saleData.sale || saleData;
          const sItems = sale.items || saleData.items || [];
          console.log("📦 Sale Items to Map:", sItems.length);

          let pm = { cash: 0, upi: 0, swipe: 0 };
          try {
            if (typeof sale.paymentMode === 'string') pm = JSON.parse(sale.paymentMode);
            else if (sale.paymentMode) pm = sale.paymentMode;
          } catch (e) { }

          setMaster(prev => ({
            ...prev,
            invoiceNo: sale.invoiceNo || '',
            customerId: sale.customerId || '',
            billDate: sale.billDate || '',
            subtotal: parseFloat(sale.subtotal) || 0,
            taxAmount: parseFloat(sale.taxAmount) || 0,
            discountAmount: sale.discountValue !== undefined && sale.discountValue !== null ? parseFloat(sale.discountValue) : (parseFloat(sale.discountAmount) || 0),
            discountType: sale.discountType || ((parseFloat(sale.discountAmount) || 0) > 0 ? 'amount' : 'percent'),
            grandTotal: parseFloat(sale.grandTotal) || 0,
            cashPaid: pm.cash || '',
            upiPaid: pm.upi || '',
            swipePaid: pm.swipe || '',
            paidAmount: parseFloat(sale.paidAmount) || 0,
            pendingAmount: parseFloat(sale.balanceAmount) || 0,
            totalDiscount: parseFloat(sale.discountAmount) || 0,
            notes: sale.notes || '',
            customerBalance: 0
          }));

          const mappedItems = sItems.map(item => {
            const prod = prodData.find(p => String(p.id) === String(item.productId)) || item.product || {};
            const multiUnits = prod.multiUnits || [];
            
            // Find conversion factor for the saved unit
            let cFactor = 1;
            if (item.unit === (prod.unit || '')) {
              cFactor = 1;
            } else {
              const mu = multiUnits.find(u => u.alternative === item.unit);
              if (mu) cFactor = parseFloat(mu.value) || 1;
            }

            const qty = parseFloat(item.quantity) || 0;
            const freeQty = parseFloat(item.freeQuantity) || 0;
            const totalDeduction = (qty + freeQty) / cFactor;

            return {
              id: item.id || Date.now() + Math.random(),
              productId: item.productId,
              productName: prod.name || item.productName || 'Unknown Product',
              primaryUnit: prod.unit || item.unit || '',
              hsnCode: prod.hsnCode || item.hsnCode || '',
              batchNo: item.batchNo || '',
              prevBatchNo: item.batchNo || '',
              expiryDate: item.expiryDate || '',
              currentStock: parseFloat(prod.currentStock) || 0,
              quantity: qty,
              freeQuantity: freeQty,
              unit: item.unit || '',
              saleRate: parseFloat(item.rate) || 0,
              discount: parseFloat(item.discount) || 0,
              discountType: (parseFloat(item.discount) || 0) > 0 ? 'amount' : 'percent',
              taxPercent: parseFloat(item.taxPercent) || 0,
              taxAmount: parseFloat(item.taxAmount) || 0,
              amount: parseFloat(item.totalAmount) || 0,
              stockIncrement: totalDeduction,
              conversionFactor: cFactor,
              multiUnits: multiUnits,
              // Mark as edited so async fetches don't overwrite historical data
              saleRateEdited: true,
              batchNoEdited: true,
              expiryDateEdited: true
            };
          });

          if (mappedItems.length > 0) {
            console.log("✨ Setting children with mapped items:", mappedItems.length);
            setChildren(mappedItems);
          } else {
            console.warn("⚠️ No items found in sale data, showing empty row.");
          }
        }
      } catch (error) {
        console.error("❌ Fetch error in EditSaleBill:", error);
      }
    };
    if (id) fetchData();
  }, [id]);

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
        if (factor < 1) {
          u.quantity = Math.max(0, (incVal / factor) - fQty);
        } else {
          u.quantity = Math.max(0, (incVal * factor) - fQty);
        }
      }

      const qty = parseFloat(u.quantity) || 0;
      const freeQty = parseFloat(u.freeQuantity) || 0;
      const rate = parseFloat(u.saleRate) || 0;
      const taxP = parseFloat(u.taxPercent) || 0;
      const factor = parseFloat(u.conversionFactor) || 1;

      // Recalculate Stock Increment if Quantity/Unit changes
      if (['quantity', 'freeQuantity', 'unit', 'productId'].includes(field)) {
        const totalQty = qty + freeQty;
        if (factor < 1) {
          u.stockIncrement = totalQty * factor;
        } else {
          u.stockIncrement = totalQty / factor;
        }
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
    setMaster(prev => ({ ...prev, [field]: value }));
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

  const handleRowKeyDown = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChildRow();
    }
  };

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

    // Validate each child row
    for (let i = 0; i < children.length; i++) {
      const row = children[i];
      if (row.productId) {
        if (!row.batchNo || String(row.batchNo).trim() === '') {
          return toast.error(`Please enter Batch No for row ${i + 1}`);
        }
        if (!row.expiryDate || String(row.expiryDate).trim() === '') {
          return toast.error(`Please enter Expiry Date for row ${i + 1}`);
        }
        if (!row.quantity || parseFloat(row.quantity) <= 0) {
          return toast.error(`Please enter a valid Quantity for row ${i + 1}`);
        }
        if (!row.unit || String(row.unit).trim() === '') {
          return toast.error(`Please select Unit for row ${i + 1}`);
        }
        if (row.stockIncrement === undefined || row.stockIncrement === null || String(row.stockIncrement).trim() === '' || parseFloat(row.stockIncrement) <= 0) {
          return toast.error(`Please enter Stock Decrement for row ${i + 1}`);
        }
        if (row.saleRate === undefined || row.saleRate === null || String(row.saleRate).trim() === '' || parseFloat(row.saleRate) <= 0) {
          return toast.error(`Please enter Sale Rate for row ${i + 1}`);
        }
      }
    }

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
        discountType: master.discountType,
        discountValue: parseFloat(master.discountAmount) || 0,
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
          expiryDate: c.expiryDate || null,
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

      const response = await ApiService.update('sales', id, payload);

      if (response) {
        toast.success("Sale Updated Successfully!");
        navigate('/sales/bills');
      }
    } catch (error) {
      console.error("Save Sale Error:", error);
      toast.error(error.response?.data?.message || "Failed to save sale");
    }
  };

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  return (
    <div className="agro-container">
      <div className="agro-unified-card" style={{ padding: '20px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Edit Sale Bill ({master.invoiceNo})</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Krushi Seva Kendra Billing System</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-agro btn-outline" onClick={() => navigate('/sales/bills')}>
              <ArrowLeft size={18} /> Back
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '15px', marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '5px', display: 'block' }}>CUSTOMER SEARCH</label>
            <SearchableSelect
              options={customers}
              value={master.customerId}
              onChange={(val) => handleMasterChange('customerId', val)}
              placeholder="Search Customer..."
              height="42px"
              showAddButton={true}
              onAddClick={() => setCustomerModalOpen(true)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '5px', display: 'block' }}>BALANCE STATUS</label>
            <div style={{
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 15px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '800',
              background: !master.customerId ? '#f1f5f9' : (master.customerBalance > 0 ? '#fee2e2' : '#dcfce7'),
              color: !master.customerId ? '#94a3b8' : (master.customerBalance > 0 ? '#ef4444' : '#16a34a'),
              border: `1px solid ${!master.customerId ? '#e2e8f0' : (master.customerBalance > 0 ? '#fecaca' : '#bbf7d0')}`
            }}>
              {!master.customerId ? 'Select Customer' : (master.customerBalance > 0 ? `Pending: ₹${master.customerBalance}` : master.customerBalance < 0 ? `Available: ₹${Math.abs(master.customerBalance)}` : 'No Dues')}
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '5px', display: 'block' }}>SALE DATE</label>
            <AgroDatePicker
              value={master.billDate}
              onChange={(e) => handleMasterChange('billDate', e.target.value)}
              height="42px"
            />
          </div>
        </div>

        <div style={{ marginBottom: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>PRODUCT DETAILS</h3>
            <button className="btn-agro btn-primary" onClick={addChildRow} style={{ height: '32px', padding: '0 15px', fontSize: '12px' }}>
              <Plus size={16} /> Add Product
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
                  <tr key={child.id} onKeyDown={(e) => handleRowKeyDown(e, idx)}>
                    <td style={{ verticalAlign: 'bottom' }}>
                      {child.productId && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '4px', fontSize: '10px', fontWeight: '700' }}>
                          <span style={{ color: '#64748b' }}>HSN: <span style={{ color: '#0f172a' }}>{child.hsnCode}</span></span>
                          <span style={{ color: '#64748b' }}>Stock: <span style={{ color: child.currentStock > 0 ? '#16a34a' : '#ef4444' }}>{child.currentStock}</span></span>
                        </div>
                      )}
                      <SearchableSelect id={`product-select-${idx}`} options={products}
                        value={child.productId}
                        onChange={(val, data) => handleChildChange(child.id, 'productId', val, data)}
                        placeholder="Select Product"
                        height="36px"
                        showAddButton={true}
                        onAddClick={() => {
                          setActiveChildRowId(child.id);
                          setProductModalOpen(true);
                        }}
                      />
                    </td>
                    <td style={{ verticalAlign: 'bottom' }}>
                       {child.productId && (
                         <div style={{ fontSize: '9px', fontWeight: '800', color: '#0284c7', textAlign: 'center', marginBottom: '2px' }}>
                           Prev: {child.prevBatchNo || 'None'}
                         </div>
                       )}
                      <input
                        type="text"
                        className="form-control"
                        value={child.batchNo}
                        readOnly
                        style={{ height: '36px', fontSize: '13px', textAlign: 'center', background: '#f8fafc', cursor: 'not-allowed' }}
                      />
                    </td>
                    <td style={{ verticalAlign: 'bottom' }}>
                      <AgroDatePicker tabIndex={child.productId ? -1 : 0} value={child.expiryDate}
                        readOnly={true}
                        height="36px"
                        align="center"
                      />
                    </td>
                    <td style={{ verticalAlign: 'bottom' }}>
                       <input
                        ref={el => qtyRefs.current[child.id] = el}
                        type="number" className="form-control" value={child.quantity ?? ''} autoComplete="new-password" data-lpignore="true" name={`rowQuantity-${child.id}`}
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
                          value={child.stockIncrement ?? ''} tabIndex={child.productId ? -1 : 0} autoComplete="new-password" data-lpignore="true" name={`rowStockDecrement-${child.id}`} tabIndex={child.productId ? -1 : 0}
                          onChange={(e) => handleChildChange(child.id, 'stockIncrement', e.target.value)}
                          style={{ height: '36px', textAlign: 'center', paddingRight: '40px', fontSize: '13px', fontWeight: '700' }}
                          readOnly={!!child.productId}
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
                    <td style={{ verticalAlign: 'bottom' }}><input type="number" className="form-control" value={child.saleRate ?? ''} tabIndex={child.productId ? -1 : 0} tabIndex={child.productId ? -1 : 0} onChange={(e) => handleChildChange(child.id, 'saleRate', e.target.value)} style={{ height: '36px', textAlign: 'center', fontWeight: '700' }} readOnly={!!child.productId} /></td>
                    <td style={{ verticalAlign: 'bottom' }}>
                       <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', height: '36px' }}>
                        <input
                          type="number"
                          className="form-control"
                          value={child.discount || ''}
                          autoComplete="off"
                          name={`rowDiscount-${child.id}`}
                          data-lpignore="true"
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
                    <td style={{ verticalAlign: 'bottom' }}><input type="number" className="form-control" value={child.taxPercent || ''} tabIndex={-1} tabIndex={-1} onChange={(e) => handleChildChange(child.id, 'taxPercent', e.target.value)} style={{ height: '36px', background: '#f8fafc', textAlign: 'center' }} readOnly /></td>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          <div className="agro-card" style={{ padding: '25px', borderRadius: '15px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={18} /> PAYMENT INFO
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>DISCOUNT</label>
                  <div style={{ display: 'flex', border: '1px solid #bbf7d0', borderRadius: '8px', overflow: 'hidden' }}>
                    <input
                      type="number"
                      className="form-control"
                      value={master.discountAmount === 0 || master.discountAmount === '0' ? '' : master.discountAmount}
                      onChange={(e) => handleMasterChange('discountAmount', e.target.value)}
                      autoComplete="off"
                      name="masterEditSaleDiscountAmount"
                      data-lpignore="true"
                      style={{ border: 'none', height: '45px', textAlign: 'center', fontWeight: '700', flex: 1 }}
                    />
                    <select
                      value={master.discountType}
                      onChange={(e) => handleMasterChange('discountType', e.target.value)}
                      style={{ border: 'none', borderLeft: '1px solid #bbf7d0', background: '#f0fdf4', fontSize: '14px', fontWeight: '800', padding: '0 10px', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="amount">₹</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>CASH (₹)</label>
                  <input 
                    type="number" 
                    name="cashPaid"
                    autoComplete="off"
                    data-lpignore="true"
                    className="form-control" 
                    value={master.cashPaid === 0 || master.cashPaid === '0' ? '' : master.cashPaid} 
                    onChange={(e) => handleMasterChange('cashPaid', e.target.value)} 
                    placeholder="0" 
                    style={{ height: '45px', textAlign: 'center', fontWeight: '700' }} 
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>UPI (₹)</label>
                  <input 
                    type="number" 
                    name="upiPaid"
                    autoComplete="off"
                    data-lpignore="true"
                    className="form-control" 
                    value={master.upiPaid === 0 || master.upiPaid === '0' ? '' : master.upiPaid} 
                    onChange={(e) => handleMasterChange('upiPaid', e.target.value)} 
                    placeholder="0" 
                    style={{ height: '45px', textAlign: 'center', fontWeight: '700' }} 
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>SWIPE (₹)</label>
                  <input 
                    type="number" 
                    name="swipePaid"
                    autoComplete="off"
                    data-lpignore="true"
                    className="form-control" 
                    value={master.swipePaid === 0 || master.swipePaid === '0' ? '' : master.swipePaid} 
                    onChange={(e) => handleMasterChange('swipePaid', e.target.value)} 
                    placeholder="0" 
                    style={{ height: '45px', textAlign: 'center', fontWeight: '700' }} 
                  />
                </div>
              </div>

              {/* Line 2: Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>PAID</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#166534' }}>₹{(master.paidAmount || 0).toFixed(2)}</span>
                </div>
                <div style={{ background: '#fef2f2', padding: '15px', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>PENDING AMOUNT</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#991b1b' }}>₹{(master.pendingAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Line 3: Notes */}
              <div className="form-group">
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>NOTES / REMARK</label>
                <textarea className="form-control" value={master.notes} onChange={(e) => handleMasterChange('notes', e.target.value)} placeholder="Write any additional notes here..." style={{ height: '60px', borderRadius: '10px', resize: 'none' }}></textarea>
              </div>
            </div>
          </div>

          {/* 4️⃣ Bill Summary Section */}
          <div style={{ background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>BILL SUMMARY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Subtotal</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>₹{parseFloat(master.subtotal || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Tax Amount</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>+ ₹{parseFloat(master.taxAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Product Discount</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>- ₹{parseFloat(master.rowDiscountAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Bill Discount</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>- ₹{parseFloat(master.masterDiscountAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Round Off</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: (master.roundOff || 0) < 0 ? '#4ade80' : (master.roundOff || 0) > 0 ? '#93c5fd' : 'rgba(255,255,255,0.7)'
                }}>
                  {(master.roundOff || 0) < 0 ? `- ₹${Math.abs(master.roundOff).toFixed(2)}` : (master.roundOff || 0) > 0 ? `+ ₹${master.roundOff.toFixed(2)}` : `₹0.00`}
                </span>
              </div>
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: '800' }}>GRAND TOTAL</span>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>₹{parseFloat(master.grandTotal || 0).toFixed(2)}</span>
              </div>

              {/* Action Buttons inside Bill Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', marginTop: '20px' }}>
                <button
                  className="btn-agro"
                  onClick={handleCancel}
                  style={{
                    height: '45px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: '700',
                    borderRadius: '10px'
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-agro"
                  onClick={() => handleSaveSale(false)}
                  disabled={children.some(c => c.productId && c.quantity > c.currentStock)}
                  style={{
                    height: '45px',
                    background: 'white',
                    color: 'var(--primary)',
                    border: 'none',
                    fontWeight: '900',
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    opacity: children.some(c => c.productId && c.quantity > c.currentStock) ? 0.6 : 1,
                    cursor: children.some(c => c.productId && c.quantity > c.currentStock) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Save size={18} /> Update Sale
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 5️⃣ Tax Breakdown Section (Professional GST Table) */}
        <div style={{ marginTop: '25px', background: '#fff', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#dcfce7', padding: '5px', borderRadius: '6px' }}>📄</span> TAX BREAKDOWN (GST)
            </h3>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', border: '1px solid #bbf7d0' }}>
              INTRA-STATE SALE (CGST + SGST)
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead style={{ background: '#f8fafc', color: '#475569' }}>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th rowSpan="2" style={{ padding: '15px', borderRight: '1px solid #f1f5f9', width: '120px' }}>HSN CODE</th>
                  <th rowSpan="2" style={{ padding: '15px', borderRight: '1px solid #f1f5f9', width: '120px' }}>TAX RATE (%)</th>
                  <th colSpan="2" style={{ padding: '10px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>CGST</th>
                  <th colSpan="2" style={{ padding: '10px', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>SGST</th>
                  <th rowSpan="2" style={{ padding: '15px', width: '140px' }}>TOTAL TAX (₹)</th>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '10px', borderRight: '1px solid #f1f5f9', fontSize: '11px' }}>RATE (%)</th>
                  <th style={{ padding: '10px', borderRight: '1px solid #f1f5f9', fontSize: '11px' }}>AMOUNT (₹)</th>
                  <th style={{ padding: '10px', borderRight: '1px solid #f1f5f9', fontSize: '11px' }}>RATE (%)</th>
                  <th style={{ padding: '10px', borderRight: '1px solid #f1f5f9', fontSize: '11px' }}>AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                {master.taxBreakdown.length > 0 ? (
                  master.taxBreakdown.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '12px', fontWeight: '700', borderRight: '1px solid #f1f5f9' }}>{item.hsn}</td>
                      <td style={{ padding: '12px', fontWeight: '700', borderRight: '1px solid #f1f5f9' }}>{item.taxRate}%</td>
                      <td style={{ padding: '12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{item.cgstRate.toFixed(2)}%</td>
                      <td style={{ padding: '12px', fontWeight: '600', borderRight: '1px solid #f1f5f9' }}>{item.cgstAmount.toFixed(2)}</td>
                      <td style={{ padding: '12px', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{item.sgstRate.toFixed(2)}%</td>
                      <td style={{ padding: '12px', fontWeight: '600', borderRight: '1px solid #f1f5f9' }}>{item.sgstAmount.toFixed(2)}</td>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#166534' }}>{item.totalTax.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', color: '#94a3b8', fontStyle: 'italic' }}>Add products to see tax breakdown</td>
                  </tr>
                )}
                <tr style={{ background: '#f0fdf4', fontWeight: '900', color: '#166534', borderTop: '2px solid #bbf7d0' }}>
                  <td colSpan="3" style={{ padding: '15px', textAlign: 'left', paddingLeft: '30px', fontSize: '14px' }}>TOTAL</td>
                  <td style={{ padding: '15px' }}>₹{(parseFloat(master.taxAmount || 0) / 2).toFixed(2)}</td>
                  <td style={{ padding: '15px' }}></td>
                  <td style={{ padding: '15px' }}>₹{(parseFloat(master.taxAmount || 0) / 2).toFixed(2)}</td>
                  <td style={{ padding: '15px', fontSize: '16px' }}>₹{parseFloat(master.taxAmount || 0).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
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
                  navigate('/sales/bills');
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

      {/* Quick Registration Modals */}
      <QuickCustomerModal
        isOpen={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        onSave={handleQuickCustomerSave}
      />
      <QuickProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleQuickProductSave}
      />
    </div>
  );
};

export default EditSaleBill;
