import React, { useState, useEffect, useRef } from 'react';
import { Save, ArrowLeft, Plus, Trash2, Truck, Calendar, FileText, RotateCcw, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../mastermodel/services/ApiService';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const NewPurchaseReturn = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});
  const [master, setMaster] = useState({
    purchaseId: '',
    supplierId: '',
    returnDate: new Date().toISOString().split('T')[0],
    reason: '',
    totalAmount: 0
  });

  useEffect(() => {
    ApiService.getAll('suppliers').then(data => setSuppliers(data));
    ApiService.getAll('products').then(data => setProducts(data));
  }, []);

  const [items, setItems] = useState([
    { id: Date.now(), productId: '', quantity: 1, purchasePrice: 0, amount: 0 }
  ]);
  const rowToFocus = useRef(null);

  useEffect(() => {
    if (rowToFocus.current) {
      setTimeout(() => {
        const el = rowRefs.current[rowToFocus.current];
        if (el) el.focus();
        rowToFocus.current = null;
      }, 100);
    }
  }, [items]);

  const addItem = (focusAfter = true) => {
    const id = Date.now() + Math.random();
    if (focusAfter) {
      rowToFocus.current = id;
    }
    setItems([...items, { id, productId: '', quantity: 1, purchasePrice: 0, amount: 0 }]);
  };

  const handleProductEnterSelect = () => addItem();

  const handleEnterNavigation = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (index === items.length - 1) {
        addItem();
      } else {
        const nextId = items[index + 1].id;
        const el = rowRefs.current[nextId];
        if (el) el.focus();
      }
    }
  };

  const handleItemChange = (id, field, value, extraData) => {
    // Check for duplicate products
    if (field === 'productId' && value) {
      const isDuplicate = items.some(item => String(item.productId) === String(value) && item.id !== id);
      if (isDuplicate) {
        toast.error("This product is already added in the list!");
        return false;
      }
      toast.success(`${extraData?.name || 'Product'} added`);
    }

    const updatedItems = items.map(item => {
      if (item.id === id) {
        let updatedItem = { ...item, [field]: value };
        if (field === 'productId') {
          if (extraData) {
            updatedItem.productName = extraData.name || '';
            updatedItem.purchasePrice = parseFloat(extraData.purchasePrice) || 0;
          } else if (!value) {
            updatedItem.productName = '';
            updatedItem.purchasePrice = 0;
            updatedItem.amount = 0;
          }
        }

        // Use 1 as default quantity for calculation if empty or <= 0
        const rawQty = parseFloat(field === 'quantity' ? value : updatedItem.quantity);
        const qty = (isNaN(rawQty) || rawQty <= 0) ? 1 : rawQty;
        
        const price = field === 'purchasePrice' || (field === 'productId' && extraData) ? (parseFloat(updatedItem.purchasePrice) || 0) : item.purchasePrice;

        updatedItem.amount = qty * price;
        return updatedItem;
      }
      return item;
    });
    setItems(updatedItems);

    // Auto-focus quantity field after selecting a product
    if (field === 'productId' && value) {
      setTimeout(() => {
        if (qtyRefs.current[id]) qtyRefs.current[id].focus();
      }, 50);
    }
    return true;
  };

  return (
    <div className="agro-container" style={{ padding: '0 5px' }}>
      <div className="agro-unified-card" style={{
        background: 'white',
        borderRadius: '16px',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border-light)',
        marginTop: '5px',
        overflow: 'hidden'
      }}>
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 10px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
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
            {/* Return Info Section */}
            <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: '#ef4444' }}>
                <RotateCcw size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Return Details</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', marginBottom: '3px' }}>Purchase ID</label>
                  <input type="text" className="form-control" style={{ height: '36px', fontSize: '13px' }} placeholder="PUR-101" value={master.purchaseId} onChange={(e) => setMaster({ ...master, purchaseId: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', marginBottom: '3px' }}>Supplier</label>
                  <SearchableSelect
                    options={suppliers}
                    value={master.supplierId}
                    onChange={(val) => setMaster({ ...master, supplierId: val })}
                    placeholder="Search Supplier..."
                    height="36px"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', marginBottom: '3px' }}>Return Date</label>
                  <input type="date" className="form-control" style={{ height: '36px', fontSize: '13px' }} value={master.returnDate} onChange={(e) => setMaster({ ...master, returnDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ margin: '10px 0 0 0' }}>
                <label style={{ fontSize: '12px', marginBottom: '3px' }}>Reason for Return</label>
                <textarea className="form-control" style={{ fontSize: '13px', minHeight: '60px', resize: 'none' }} placeholder="Reason..." value={master.reason} onChange={(e) => setMaster({ ...master, reason: e.target.value })} />
              </div>
            </div>

            {/* Item Table Section */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 15px', background: 'white', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                  <Package size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Return Items</h3>
                </div>
                <button className="btn-agro btn-primary" onClick={addItem} style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}>
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div className="agro-table-wrapper-simple" style={{ overflowX: 'auto' }}>
                <table className="agro-table" style={{ border: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '250px', background: 'white' }}>Product Name</th>
                      <th style={{ width: '100px', background: 'white' }}>Quantity</th>
                      <th style={{ width: '120px', background: 'white' }}>Purchase Price</th>
                      <th style={{ width: '150px', background: 'white' }}>Amount</th>
                      <th style={{ width: '40px', background: 'white' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id}>
                        <td>
                          <SearchableSelect
                            options={products}
                            value={item.productId}
                            onChange={(val, data) => handleItemChange(item.id, 'productId', val, data)}
                            onEnterSelect={handleProductEnterSelect}
                            placeholder="Search Product..."
                            height="34px"
                            inputRef={el => rowRefs.current[item.id] = el}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" 
                            className="form-control" 
                            style={{ height: '34px', fontSize: '13px' }} 
                            ref={el => qtyRefs.current[item.id] = el}
                            value={item.quantity} 
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                            onBlur={(e) => {
                              if (!e.target.value || parseFloat(e.target.value) <= 0) {
                                handleItemChange(item.id, 'quantity', '1');
                              }
                            }}
                            onKeyDown={(e) => handleEnterNavigation(e, idx)} 
                          />
                        </td>
                        <td><input type="number" className="form-control" style={{ height: '34px', fontSize: '13px' }} value={item.purchasePrice} onChange={(e) => handleItemChange(item.id, 'purchasePrice', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td style={{ fontSize: '13px', fontWeight: '700' }}>₹{item.amount.toFixed(2)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => setItems(items.filter(i => i.id !== item.id))} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', marginTop: '5px' }}>
              <div style={{ textAlign: 'right', padding: '15px 25px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2', minWidth: '220px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#ef4444' }}>Total Return Value</p>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>₹{items.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</h2>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/returns')} style={{ flex: 1, height: '38px', fontSize: '13px' }}>Cancel</button>
                  <button className="btn-agro btn-primary" style={{ flex: 1, height: '38px', fontSize: '13px', background: '#ef4444' }}><RotateCcw size={18} /> Confirm Return</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseReturn;
