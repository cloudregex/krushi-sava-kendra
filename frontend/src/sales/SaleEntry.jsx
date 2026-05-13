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
  discount: '',
  discountType: 'fixed',
  taxPercent: '',
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

  const [master, setMaster] = useState({
    invoiceNo: '',
    customerId: '',
    billDate: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    grandTotal: 0,
    cashPaid: '',
    upiPaid: '',
    swipePaid: '',
    pendingAmount: 0,
    totalDiscount: 0,
    notes: '',
    customerBalance: 0,
    taxBreakdown: []
  });

  const [children, setChildren] = useState([newRow()]);
  const rowToFocus = useRef(null);

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
      const disc = parseFloat(child.actualDiscount) || 0; // Use calculated discount
      const taxP = parseFloat(child.taxPercent) || 0;

      const rowSub = qty * rate;
      const rowTax = (rowSub * taxP) / 100; // Tax on gross

      subtotal += rowSub;
      totalRowDiscount += disc;
      totalTax += rowTax;
    });

    setMaster(prev => {
      // Correctly parse values from the current state
      const mDisc = parseFloat(prev.discountAmount) || 0;
      const cPaid = parseFloat(prev.cashPaid) || 0;
      const uPaid = parseFloat(prev.upiPaid) || 0;
      const sPaid = parseFloat(prev.swipePaid) || 0;

      const totalBillDiscount = totalRowDiscount + mDisc;
      const finalGrandTotal = Math.max(0, subtotal + totalTax - totalBillDiscount);

      // --- DYNAMIC TAX BREAKDOWN LOGIC ---
      const hsnMap = {};
      rows.forEach(child => {
        if (!child.productId) return;
        const hsn = child.hsnCode || 'N/A';
        const taxP = parseFloat(child.taxPercent) || 0;
        const rowGross = (parseFloat(child.quantity) || 0) * (parseFloat(child.saleRate) || 0);
        // Tax is usually on (Gross - RowDiscount)
        const rowDisc = parseFloat(child.actualDiscount) || 0;
        const taxableVal = rowGross - rowDisc;
        const rowTax = (taxableVal * taxP) / 100;

        if (!hsnMap[hsn]) {
          hsnMap[hsn] = {
            hsn,
            taxRate: taxP,
            cgstRate: taxP / 2,
            sgstRate: taxP / 2,
            cgstAmount: rowTax / 2,
            sgstAmount: rowTax / 2,
            totalTax: rowTax
          };
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
        discountAmount: mDisc,
        totalDiscount: totalBillDiscount, // Store total for display
        grandTotal: finalGrandTotal,
        pendingAmount: Math.max(0, finalGrandTotal - (cPaid + uPaid + sPaid)),
        taxBreakdown: Object.values(hsnMap)
      };
    });
  };

  const handleChildChange = (id, field, value, extraData) => {
    const updated = children.map(child => {
      if (child.id !== id) return child;

      let u = { ...child, [field]: value };

      // If product changes, auto-fill details
      if (field === 'productId') {
        if (extraData) {
          u.productName = extraData.name || '';
          u.hsnCode = extraData.hsnCode || '';
          u.currentStock = extraData.currentStock || 0;
          u.unit = extraData.unit || '';
          u.primaryUnit = extraData.unit || '';
          u.taxPercent = parseFloat(extraData.tax) || 0;
          u.saleRate = extraData.saleRate || (extraData.multiUnits && extraData.multiUnits.length > 0 ? extraData.multiUnits[0].amount : '');
          u.multiUnits = extraData.multiUnits || [];
          u.conversionFactor = 1;
          u.batchNo = '';
          u.expiryDate = '';
          // Set defaults only when product is picked
          u.quantity = 1;
          u.freeQuantity = 0;
          u.discount = 0;

          // FETCH LATEST BATCH ASYNCHRONOUSLY
          if (value) {
            ApiService.getById('products', `${value}/latest-batch`).then(res => {
              if (res && res.batchNo) {
                setChildren(prevRows => prevRows.map(row => 
                  row.id === id ? { ...row, prevBatchNo: res.batchNo } : row
                ));
              }
            }).catch(err => console.log("Batch fetch error:", err));
          }
        } else {
          // If product is cleared, reset the entire row except ID
          const fresh = newRow();
          u = { ...fresh, id: u.id };
        }
      }

      // If unit changes, update conversion factor
      if (field === 'unit') {
        const mu = u.multiUnits.find(m => m.alternative === value);
        u.conversionFactor = mu ? (parseFloat(mu.conversion) || 1) : 1;
      }

      // Extract current values for math
      const qty = parseFloat(u.quantity) || 0;
      const freeQty = parseFloat(u.freeQuantity) || 0;
      const rate = parseFloat(u.saleRate) || 0;
      const disc = parseFloat(u.discount) || 0;
      const taxP = parseFloat(u.taxPercent) || 0;
      const factor = parseFloat(u.conversionFactor) || 1;

      // Auto-calculate stockIncrement in primary unit
      if (['quantity', 'freeQuantity', 'unit', 'productId'].includes(field)) {
        u.stockIncrement = (qty + freeQty) / factor;
      }

      // Calculate actual discount value based on type
      const rowSub = qty * rate;
      let actualDisc = 0;
      const dVal = parseFloat(u.discount) || 0;
      if (u.discountType === 'percent') {
        actualDisc = (rowSub * dVal) / 100;
      } else {
        actualDisc = dVal;
      }

      // Calculate Amount (Strictly Excluding Tax for table display)
      const rowTax = (rowSub * taxP) / 100;

      u.taxAmount = rowTax;
      u.amount = rowSub - actualDisc; // Net amount for table
      u.actualDiscount = actualDisc; // Store for global totals
      return u;
    });

    setChildren(updated);
    calculateTotals(updated);

    if (field === 'productId' && value) {
      setTimeout(() => qtyRefs.current[id]?.focus(), 50);
    }
    return true;
  };

  const handleMasterChange = (field, value) => {
    if (field === 'customerId') {
      if (value) {
        const customer = customers.find(c => String(c.id) === String(value));
        // Auto-fetch invoice and set date when customer is picked
        ApiService.getAll('sales/next-invoice').then(invData => {
          setMaster(prev => ({
            ...prev,
            customerId: value,
            customerBalance: customer?.balance || 0,
            invoiceNo: invData.invoiceNo,
            billDate: new Date().toISOString().split('T')[0]
          }));
        }).catch(err => console.error("Invoice fetch error:", err));
      } else {
        // Reset everything if customer is cleared
        setMaster(prev => ({
          ...prev,
          customerId: '',
          customerBalance: 0,
          invoiceNo: '',
          billDate: ''
        }));
      }
    } else if (['cashPaid', 'upiPaid', 'swipePaid'].includes(field)) {
      const val = parseFloat(value) || 0;
      setMaster(prev => ({ ...prev, [field]: val }));

      // Get current values to pass to calculateTotals
      const cash = field === 'cashPaid' ? val : master.cashPaid;
      const upi = field === 'upiPaid' ? val : master.upiPaid;
      const swipe = field === 'swipePaid' ? val : master.swipePaid;
      calculateTotals(children, master.discountAmount, cash, upi, swipe);
    } else {
      setMaster(prev => {
        const newState = { ...prev, [field]: value };
        // Recalculate everything with new state
        setTimeout(() => calculateTotals(children), 0);
        return newState;
      });
    }
  };

  const addChildRow = () => {
    const r = newRow();
    setChildren([...children, r]);
    rowToFocus.current = r.id;
  };

  const removeChildRow = (id) => {
    if (children.length > 1) {
      const updated = children.filter(c => c.id !== id);
      setChildren(updated);
      calculateTotals(updated, master.discountAmount, master.paymentMode);
    }
  };

  const handleSaveSale = async () => {
    if (!master.customerId) return toast.error("Please select a customer");
    if (children.some(c => !c.productId)) return toast.error("Please select products for all rows");

    try {
      const payload = {
        ...master,
        items: children.map(c => ({
          productId: c.productId,
          batchNo: c.batchNo,
          expiryDate: c.expiryDate,
          quantity: c.quantity,
          freeQuantity: c.freeQuantity,
          unit: c.unit,
          rate: c.saleRate,
          discount: c.discount,
          taxPercent: c.taxPercent,
          taxAmount: c.taxAmount,
          totalAmount: c.amount,
          stockIncrement: c.stockIncrement,
          conversionFactor: c.conversionFactor
        }))
      };
      await ApiService.add('sales', payload);
      toast.success("Sale saved successfully!");
      navigate('/sales/bills');
    } catch (error) {
      toast.error("Failed to save sale");
    }
  };

  return (
    <div className="agro-container">
      <div className="agro-unified-card" style={{ padding: '20px' }}>

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Professional Sale Bill</h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>Krushi Seva Kendra Billing System</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-agro btn-outline" onClick={() => navigate('/sales/bills')}>
              <ArrowLeft size={18} /> Back
            </button>
          </div>
        </div>

        {/* 1️⃣ Invoice Details Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '15px', marginBottom: '25px', background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '12px', fontWeight: '700', marginBottom: '5px', display: 'block' }}>CUSTOMER SEARCH</label>
            <SearchableSelect
              options={customers}
              value={master.customerId}
              onChange={(val) => handleMasterChange('customerId', val)}
              placeholder="Search Customer..."
              height="42px"
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
            <input type="date" className="form-control" value={master.billDate} onChange={(e) => handleMasterChange('billDate', e.target.value)} style={{ height: '42px' }} />
          </div>
        </div>

        {/* 2️⃣ Products Section */}
        <div style={{ marginBottom: '25px', borderRadius: '15px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: 'var(--primary)' }}>PRODUCT DETAILS</h3>
            <button className="btn-agro btn-primary" onClick={addChildRow} style={{ height: '32px', padding: '0 15px', fontSize: '12px' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="agro-table" style={{ width: '100%', minWidth: '1350px' }}>
              <thead style={{ background: '#f1f5f9' }}>
                <tr>
                  <th style={{ width: '350px', textAlign: 'center' }}>PRODUCT NAME</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>BATCH</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>EXPIRY</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>QTY</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>FREE QTY</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>UNIT</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>STOCK INC</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>SALE RATE</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>DISC</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>TAX %</th>
                  <th style={{ width: '140px', textAlign: 'center' }}>TOTAL</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {children.map((child, idx) => (
                  <tr key={child.id}>
                    <td style={{ verticalAlign: 'top' }}>
                      <SearchableSelect
                        options={products}
                        value={child.productId}
                        onChange={(val, data) => handleChildChange(child.id, 'productId', val, data)}
                        placeholder="Select Product"
                        height="36px"
                      />
                      {child.productId && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '10px', fontWeight: '700' }}>
                          <span style={{ color: '#64748b' }}>HSN: <span style={{ color: '#0f172a' }}>{child.hsnCode}</span></span>
                          <span style={{ color: '#64748b' }}>Stock: <span style={{ color: child.currentStock > 0 ? '#16a34a' : '#ef4444' }}>{child.currentStock}</span></span>
                        </div>
                      )}
                    </td>
                    <td>
                      {child.productId && (
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textAlign: 'center', marginBottom: '2px' }}>
                          Prev: {child.prevBatchNo || 'No History'}
                        </div>
                      )}
                      <input type="text" className="form-control" value={child.batchNo} onChange={(e) => handleChildChange(child.id, 'batchNo', e.target.value)} style={{ height: '36px', fontSize: '13px', textAlign: 'center' }} />
                    </td>
                    <td><input type="date" className="form-control" value={child.expiryDate} onChange={(e) => handleChildChange(child.id, 'expiryDate', e.target.value)} style={{ height: '36px', fontSize: '13px', textAlign: 'center' }} /></td>
                    <td>
                      <input
                        ref={el => qtyRefs.current[child.id] = el}
                        type="number" className="form-control" value={child.quantity}
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
                    <td><input type="number" className="form-control" value={child.freeQuantity || ''} onChange={(e) => handleChildChange(child.id, 'freeQuantity', e.target.value)} style={{ height: '36px', textAlign: 'center' }} /></td>
                    <td>
                      <select
                        className="form-control"
                        value={child.unit}
                        onChange={(e) => handleChildChange(child.id, 'unit', e.target.value)}
                        style={{ height: '36px', fontSize: '13px', textAlign: 'center' }}
                      >
                        {/* Always show the primary unit first */}
                        <option value={child.primaryUnit || child.unit}>{child.primaryUnit || child.unit}</option>

                        {/* Show alternative units if they are not the same as primary */}
                        {child.multiUnits && child.multiUnits.map((mu, i) => (
                          mu.alternative !== (child.primaryUnit || child.unit) && (
                            <option key={i} value={mu.alternative}>{mu.alternative}</option>
                          )
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input
                          type="number"
                          className="form-control"
                          value={child.stockIncrement}
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
                    <td><input type="number" className="form-control" value={child.saleRate === 0 || child.saleRate === '0' ? '' : child.saleRate} onChange={(e) => handleChildChange(child.id, 'saleRate', e.target.value)} style={{ height: '36px', textAlign: 'center', fontWeight: '700' }} /></td>
                    <td>
                      <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', height: '36px' }}>
                        <input
                          type="number"
                          className="form-control"
                          value={child.discount || ''}
                          onChange={(e) => handleChildChange(child.id, 'discount', e.target.value)}
                          style={{ border: 'none', width: '50px', textAlign: 'center', fontSize: '13px', borderRadius: 0, padding: '0' }}
                        />
                        <select
                          value={child.discountType}
                          onChange={(e) => handleChildChange(child.id, 'discountType', e.target.value)}
                          style={{ border: 'none', background: '#f8fafc', borderLeft: '1px solid #e2e8f0', fontSize: '12px', padding: '0 2px', cursor: 'pointer', outline: 'none' }}
                        >
                          <option value="fixed">₹</option>
                          <option value="percent">%</option>
                        </select>
                      </div>
                    </td>
                    <td><input type="number" className="form-control" value={child.taxPercent} onChange={(e) => handleChildChange(child.id, 'taxPercent', e.target.value)} style={{ height: '36px', background: '#f8fafc', textAlign: 'center' }} readOnly /></td>
                    <td style={{ fontWeight: '800', color: 'var(--primary)', textAlign: 'right', paddingRight: '15px' }}>₹{child.amount.toFixed(2)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => removeChildRow(child.id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: 3️⃣ Payment, 4️⃣ Summary, 5️⃣ Tax Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>

          {/* 3️⃣ Payment Info Section */}
          <div className="agro-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} /> PAYMENT INFO
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
              <div className="form-group">
                <label>CASH (₹)</label>
                <input type="number" className="form-control" value={master.cashPaid === 0 || master.cashPaid === '0' ? '' : master.cashPaid} onChange={(e) => handleMasterChange('cashPaid', e.target.value)} placeholder="0" style={{ height: '45px', textAlign: 'center', fontWeight: '700' }} />
              </div>
              <div className="form-group">
                <label>UPI (₹)</label>
                <input type="number" className="form-control" value={master.upiPaid === 0 || master.upiPaid === '0' ? '' : master.upiPaid} onChange={(e) => handleMasterChange('upiPaid', e.target.value)} placeholder="0" style={{ height: '45px', textAlign: 'center', fontWeight: '700' }} />
              </div>
              <div className="form-group">
                <label>SWIPE (₹)</label>
                <input type="number" className="form-control" value={master.swipePaid === 0 || master.swipePaid === '0' ? '' : master.swipePaid} onChange={(e) => handleMasterChange('swipePaid', e.target.value)} placeholder="0" style={{ height: '45px', textAlign: 'center', fontWeight: '700' }} />
              </div>
              <div className="form-group">
                <label style={{ color: '#ef4444' }}>PENDING (₹)</label>
                <div style={{ height: '45px', background: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#ef4444', border: '1px solid #fee2e2' }}>
                  {master.pendingAmount.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>NOTES / REMARK</label>
              <textarea className="form-control" value={master.notes} onChange={(e) => handleMasterChange('notes', e.target.value)} placeholder="Add any notes here..." rows="2" style={{ resize: 'none' }}></textarea>
            </div>
          </div>

          {/* 4️⃣ Bill Summary Section */}
          <div style={{ background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>BILL SUMMARY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Subtotal</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>₹{master.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Tax Amount</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>+ ₹{master.taxAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', opacity: 0.9 }}>Discount Amount</span>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>- ₹{(master.totalDiscount || 0).toFixed(2)}</span>
              </div>
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '2px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: '800' }}>GRAND TOTAL</span>
                <span style={{ fontSize: '24px', fontWeight: '900' }}>₹{master.grandTotal.toFixed(2)}</span>
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
                  <td style={{ padding: '15px' }}>₹{(master.taxAmount / 2).toFixed(2)}</td>
                  <td style={{ padding: '15px' }}></td>
                  <td style={{ padding: '15px' }}>₹{(master.taxAmount / 2).toFixed(2)}</td>
                  <td style={{ padding: '15px', fontSize: '16px' }}>₹{master.taxAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <button className="btn-agro btn-outline" style={{ height: '45px', padding: '0 25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Printer size={20} /> Print Bill
          </button>
          <button
            className="btn-agro btn-primary"
            onClick={handleSaveSale}
            disabled={children.some(c => c.productId && c.quantity > c.currentStock)}
            style={{
              height: '45px',
              padding: '0 40px',
              fontSize: '16px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              opacity: children.some(c => c.productId && c.quantity > c.currentStock) ? 0.6 : 1,
              cursor: children.some(c => c.productId && c.quantity > c.currentStock) ? 'not-allowed' : 'pointer'
            }}
          >
            <Save size={20} /> Save Sale
          </button>
        </div>

      </div>
    </div>
  );
};

export default SaleEntry;
