import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Search } from 'lucide-react';
import { useCRUD } from '../../hooks/useCRUD';
import { MockService } from '../../services/MockService';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/MasterModel.css';

const CategoryList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const {
    data, loading, isDeleteOpen, setIsDeleteOpen,
    currentItem, handleDeleteClick, handleConfirmDelete
  } = useCRUD('categories');

  useEffect(() => {
    MockService.getAll('products').then(setProducts);
  }, []);

  const getProductCount = (categoryName) => {
    return products.filter(p => p.category === categoryName).length;
  };

  const columns = [
    { header: 'Category Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Products',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={16} color="#16a34a" />
          <span style={{ fontWeight: 'bold', color: '#16a34a' }}>{getProductCount(row.name)}</span>
        </div>
      )
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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && item.isActive === true) ||
      (statusFilter === 'inactive' && item.isActive === false);
    return matchesSearch && matchesStatus;
  });

  const handleAdd = () => navigate('/categories/create');
  const handleEdit = (item) => navigate(`/categories/edit/${item.id}`);

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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Product Categories</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Manage product groupings</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search..."
                className="form-control"
                style={{ paddingLeft: '35px', paddingRight: '12px', height: '38px', fontSize: '13px', borderRadius: '10px', border: '1px solid var(--border)' }}
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

          <button className="btn-agro btn-primary" onClick={handleAdd} style={{ height: '38px', padding: '0 16px' }}>
            <Plus size={18} /> Add
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <DataTable
            title="Categories"
            columns={columns}
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            hideControls={true}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete ${currentItem?.name}?`}
      />
    </div>
  );
};

export default CategoryList;
