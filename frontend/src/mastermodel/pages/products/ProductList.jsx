import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCRUD } from '../../hooks/useCRUD';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/MasterModel.css';

import { useAuth } from '../../../adminauth/context/AuthContext';

const ProductList = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const {
    data, loading, isDeleteOpen, setIsDeleteOpen,
    currentItem, handleDeleteClick, handleConfirmDelete
  } = useCRUD('products');

  const columns = [
    {
      header: 'Product Name',
      render: (row) => (
        <div style={{ color: '#334155' }}>
          <span>{row.name}</span>
          {row.marathiName && (
            <span style={{ color: '#16a34a', fontSize: '12px', marginLeft: '6px' }}>({row.marathiName})</span>
          )}
        </div>
      )
    },
    { header: 'Code', accessor: 'code' },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Packing',
      render: (row) => row.primaryUnit ? `1 ${row.primaryUnit} = ${row.conversionFactor} ${row.secondaryUnit}` : 'N/A'
    },
    {
      header: 'Current Stock',
      render: (row) => {
        const isLowStock = Number(row.currentStock) <= Number(row.minStock);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '700', color: isLowStock ? '#ef4444' : '#16a34a' }}>
              {row.currentStock || 0} {row.secondaryUnit}
            </span>
            {isLowStock ? (
              <span className="badge badge-danger" style={{ fontSize: '10px', padding: '2px 8px' }}>
                Low by {Number(row.minStock) - Number(row.currentStock)}
              </span>
            ) : (
              <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 8px' }}>
                Sufficient
              </span>
            )}
          </div>
        );
      }
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-danger'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive === true) ||
      (statusFilter === 'inactive' && item.isActive === false);
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => navigate('/products/create');
  const handleEdit = (item) => navigate(`/products/edit/${item.id}`);
  const handleView = (item) => navigate(`/products/view/${item.id}`);

  return (
    <div className="agro-container">
      <div className="agro-unified-card">
        <div className="agro-header-compact" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 25px',
          borderBottom: '1px solid var(--border-light)',
          background: 'white'
        }}>
          <div style={{ flexShrink: 0 }}>
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Product Inventory</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Manage stocks, pricing and categories</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Plus size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'none' }} />
              <input
                type="text"
                placeholder="Search products..."
                className="form-control"
                style={{ paddingLeft: '15px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: '130px', height: '38px', fontSize: '13px', borderRadius: '10px', background: '#f8fafc', border: '1px solid var(--border)' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {hasPermission('product', 'create') && (
            <button className="btn-agro btn-primary" onClick={handleAdd} style={{ height: '38px', padding: '0 16px' }}>
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>

        <div style={{ padding: '10px' }}>
          <DataTable
            title="Products"
            columns={columns}
            data={filteredData}
            onEdit={hasPermission('product', 'edit') ? handleEdit : null}
            onDelete={hasPermission('product', 'delete') ? handleDeleteClick : null}
            onView={handleView}
            hideControls={true}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product?"
        message={`Are you sure you want to delete ${currentItem?.name}?`}
      />
    </div>
  );
};

export default ProductList;
