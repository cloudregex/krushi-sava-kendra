import React, { useState, useEffect, useRef } from 'react';
import { Save, ArrowLeft, Plus, Trash2, Truck, Calendar, ShoppingBag, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ApiService } from '../mastermodel/services/ApiService';
import SearchableSelect from './SearchableSelect';
import toast from 'react-hot-toast';
import '../mastermodel/styles/MasterModel.css';

const NewPurchaseOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const rowRefs = useRef({});
  const qtyRefs = useRef({});
  const [units, setUnits] = useState([]);
  const [master, setMaster] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Pending'
  });

  useEffect(() => {
    ApiService.getAll('suppliers').then(data => setSuppliers(data));
    ApiService.getAll('products').then(data => {
      console.log('Fetched products:', data);
      setProducts(data);
    });
    ApiService.getAll('units').then(data => setUnits(data));
  }, []);

  useEffect(() => {
    if (id) {
      ApiService.getById('purchase-orders', id).then(data => {
        if (data) {
          setMaster({
            supplierId: data.supplierId || '',
            orderDate: data.orderDate || new Date().toISOString().split('T')[0],
            expiryDate: data.expiryDate || '',
            status: data.status || 'Pending'
          });
          if (data.items && data.items.length > 0) {
            setItems(data.items.map(item => ({
              ...item,
              id: item.id || Date.now() + Math.random(),
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unit: item.unit,
              expectedPrice: item.expectedPrice
            })));
          }
        }
      });
    }
  }, [id]);

  const [items, setItems] = useState([
    { id: Date.now(), productId: '', productName: '', quantity: 1, unit: '', expectedPrice: 0 }
  ]);
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
  }, [items]);

  const addItem = (focusAfter = true) => {
    const id = Date.now() + Math.random();
    if (focusAfter) {
      rowToFocus.current = id;
    }
    setItems([...items, { id, productId: '', productName: '', quantity: 1, unit: 'Kg', expectedPrice: 0 }]);
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

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
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
            updatedItem.expectedPrice = parseFloat(extraData.purchasePrice) || 0;
            // Removed automatic unit selection as per user request
          } else if (!value) {
            updatedItem.productName = '';
            updatedItem.expectedPrice = 0;
          }
        }

        // Use 1 as default quantity for calculation if empty or <= 0
        updatedItem.quantity = field === 'quantity' ? value : updatedItem.quantity;
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

  const handleSaveOrder = async () => {
    if (!master.supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Please add at least one valid product");
      return;
    }

    try {
      const payload = {
        id: id ? Number(id) : undefined,
        ...master,
        items: validItems.map(i => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unit: i.unit,
          expectedPrice: i.expectedPrice
        }))
      };
      await ApiService.save('purchase-orders', payload);
      toast.success('Purchase Order placed successfully');
      navigate('/purchase/orders');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
  };

  return (
    <div className="agro-container" style={{ padding: '0 25px' }}>
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
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '1px' }}>New Purchase Order</h2>
            <p style={{ fontSize: '12px', margin: 0 }}>Place a new order with your supplier</p>
          </div>
          <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/orders')} style={{ height: '34px', padding: '0 12px', fontSize: '12px' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div style={{ padding: '15px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Order Details Section */}
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--primary)' }}>
                <ShoppingBag size={16} />
                <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Order Info</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '10px' }}>
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
                  <label style={{ fontSize: '12px', marginBottom: '3px' }}>Order Date</label>
                  <input type="date" className="form-control" style={{ height: '36px', fontSize: '13px' }} value={master.orderDate} onChange={(e) => setMaster({ ...master, orderDate: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', marginBottom: '3px' }}>Exp. Delivery</label>
                  <input type="date" className="form-control" style={{ height: '36px', fontSize: '13px' }} value={master.expiryDate} onChange={(e) => setMaster({ ...master, expiryDate: e.target.value })} />
                </div>
              </div>
            </div>

            {/* Product Table Section */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 15px', background: '#f8fafc', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                  <Package size={16} />
                  <h3 style={{ fontSize: '13px', margin: 0, fontWeight: '700' }}>Order Items</h3>
                </div>
                <button className="btn-agro btn-primary" onClick={addItem} style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}>
                  <Plus size={14} /> Add Row
                </button>
              </div>
              <div className="agro-table-wrapper-simple" style={{ overflowX: 'auto' }}>
                <table className="agro-table" style={{ border: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '250px' }}>Product Name</th>
                      <th style={{ width: '100px' }}>Quantity</th>
                      <th style={{ width: '120px' }}>Unit</th>
                      <th style={{ width: '120px' }}>Expected Rate</th>
                      <th style={{ width: '40px' }}></th>
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
                        <td>
                          <SearchableSelect
                            options={units.map(u => ({ ...u, id: u.name }))}
                            value={item.unit}
                            onChange={(val) => handleItemChange(item.id, 'unit', val)}
                            placeholder="Unit"
                            height="34px"
                          />
                        </td>
                        <td><input type="number" className="form-control" style={{ height: '34px', fontSize: '13px' }} value={item.expectedPrice} onChange={(e) => handleItemChange(item.id, 'expectedPrice', e.target.value)} onKeyDown={(e) => handleEnterNavigation(e, idx)} /></td>
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => removeItem(item.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', padding: '10px 0' }}>
              <button className="btn-agro btn-outline" onClick={() => navigate('/purchase/orders')} style={{ width: '120px', height: '38px', fontSize: '13px' }}>Cancel</button>
              <button className="btn-agro btn-primary" onClick={handleSaveOrder} style={{ width: '150px', height: '38px', fontSize: '13px' }}><Save size={18} /> Place Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewPurchaseOrder;
