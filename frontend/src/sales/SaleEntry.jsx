import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Calendar, User, CreditCard, IndianRupee, Package } from 'lucide-react';
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
  saleRate: '',
  taxPercent: '',
  taxAmount: 0,
  amount: 0
});

const SaleEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});

  const [master, setMaster] = useState({
    customerId: location.state?.quotationData?.customerId || '',
    billDate: new Date().toISOString().split('T')[0],
    totalQuantity: 0,
    subtotal: location.state?.quotationData?.totalAmount || 0,
    discount: 0,
    taxAmount: 0,
    grandTotal: location.state?.quotationData?.totalAmount || 0,
    paymentType: 'Cash',
    paidAmount: 0,
    dueAmount: location.state?.quotationData?.totalAmount || 0
  });

  const [children, setChildren] = useState([newRow()]);
  const rowToFocus = useRef(null);

  // Focus the new row automatically after it renders
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
    ApiService.getAll('customers').then(data => setCustomers(data));
    ApiService.getAll('products').then(data => setProducts(data));
  }, []);

  const calculateTotals = (rows, discount) => {
    let totalQty = 0, subtotal = 0, totalTax = 0;
    rows.forEach(child => {
      const qty = parseFloat(child.quantity) || 0;
      const rate = parseFloat(child.saleRate) || 0;
      const taxP = parseFloat(child.taxPercent) || 0;
      const rowSub = qty * rate;
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
      taxAmount: totalTax,
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
          u.saleRate = parseFloat(extraData.salePrice) || '';
          u.taxPercent = parseFloat(extraData.tax) || '';
        } else if (!value) {
          // Clear everything if product is cleared
          u.productName = '';
          u.batchNo = '';
          u.saleRate = '';
          u.taxPercent = '';
          u.amount = 0;
          u.taxAmount = 0;
        }
      }

      // Use 1 as default quantity for calculation if empty or <= 0
      const rawQty = parseFloat(field === 'quantity' ? value : u.quantity);
      const qty = (isNaN(rawQty) || rawQty <= 0) ? 1 : rawQty;

      const rate = parseFloat(field === 'saleRate' ? value : u.saleRate) || 0;
      const taxP = parseFloat(field === 'taxPercent' ? value : u.taxPercent) || 0;
      const rowSub = qty * rate;
      const rowTax = (rowSub * taxP) / 100;
      u.taxAmount = rowTax;
      u.amount = rowSub + rowTax;
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

  const addChildRow = (focusAfter = true) => {
    const r = newRow();
    if (focusAfter) {
      rowToFocus.current = r.id;
    }
    setChildren(prev => [...prev, r]);
    return r.id;
  };

  const removeChildRow = (id) => {
    if (children.length > 1) {
      const updated = children.filter(c => c.id !== id);
      setChildren(updated);
      calculateTotals(updated, master.discount);
    }
  };

  // Called when product is selected via Enter key — add new row and focus it
  const handleProductEnterSelect = (rowId) => {
    addChildRow(true);
  };

  // On Enter, focus next row's Product Name. If last row, add new row.
  const handleEnterNavigation = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === children.length - 1) {
        addChildRow(true);
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
      updated.grandTotal = Math.max(0, updated.subtotal + updated.taxAmount - disc);
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
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>New Sale Entry</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Create a new sales invoice</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate(location.state?.quotationData ? '/sales/quotations' : '/sales/bills')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Invoice Details Section */}
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                <User size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Invoice Details</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', marginBottom: '3px' }}>Customer</label>
                  <SearchableSelect
                    options={customers}
                    value={master.customerId}
                    onChange={(val) => handleMasterChange('customerId', val)}
                    placeholder="Search Customer..."
                    height="36px"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', marginBottom: '3px' }}>Bill Date</label>
                  <input
                    type="date"
                    className="form-control"
                    style={{ height: '36px', fontSize: '13px' }}
                    value={master.billDate}
                    onChange={(e) => handleMasterChange('billDate', e.target.value)}
                  />
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
                <button className="btn-agro btn-primary" onClick={addChildRow} style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}>
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div className="agro-table-wrapper-simple" style={{ overflowX: 'auto' }}>
                <table className="agro-table" style={{ border: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '250px' }}>Product Name</th>
                      <th style={{ width: '80px' }}>Qty</th>
                      <th style={{ width: '100px' }}>Rate</th>
                      <th style={{ width: '70px' }}>Tax %</th>
                      <th style={{ width: '100px' }}>Tax Amt</th>
                      <th style={{ width: '100px' }}>Amount</th>
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
                            onEnterSelect={() => handleProductEnterSelect(child.id)}
                            placeholder="Search Product..."
                            height="34px"
                            inputRef={el => rowRefs.current[child.id] = el}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            style={{ height: '34px', fontSize: '13px' }}
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
                        <td>
                          <input type="number" className="form-control" style={{ height: '34px', fontSize: '13px' }} value={child.saleRate} onChange={(e) => handleChildChange(child.id, 'saleRate', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                        </td>
                        <td>
                          <input type="number" className="form-control" style={{ height: '34px', fontSize: '13px' }} value={child.taxPercent} onChange={(e) => handleChildChange(child.id, 'taxPercent', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} />
                        </td>
                        <td style={{ fontSize: '13px' }}>₹{child.taxAmount.toFixed(2)}</td>
                        <td style={{ fontSize: '13px', fontWeight: '700' }}>₹{child.amount.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => removeChildRow(child.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
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
                    <span>Total Tax</span>
                    <span>₹{(parseFloat(master.taxAmount) || 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: 'var(--primary)', borderTop: '1px solid #dcfce7', paddingTop: '10px', marginTop: '10px' }}>
                    <span>Grand Total</span>
                    <span>₹{(parseFloat(master.grandTotal) || 0).toFixed(2)}</span>
                  </div>
                  <button className="btn-agro btn-primary" style={{ width: '100%', marginTop: '15px', height: '40px', fontSize: '14px' }}>
                    <Save size={18} /> Complete Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleEntry;
