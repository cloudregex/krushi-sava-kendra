import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useCRUD } from '../../hooks/useCRUD';
import DataTable from '../../components/DataTable';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/MasterModel.css';

const SupplierList = () => {
  const navigate = useNavigate();
  const {
    data, loading, isDeleteOpen, setIsDeleteOpen,
    currentItem, handleDeleteClick, handleConfirmDelete
  } = useCRUD('suppliers');

  const columns = [
    { header: 'Supplier Name', accessor: 'name' },
    { header: 'Mobile', accessor: 'mobile' },
    { header: 'GST No', accessor: 'gstNo' },
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

  const handleAdd = () => navigate('/suppliers/create');
  const handleEdit = (item) => navigate(`/suppliers/edit/${item.id}`);
  const handleView = (item) => navigate(`/suppliers/view/${item.id}`);

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
            <h2 style={{ marginBottom: '2px', fontSize: '20px' }}>Supplier Management</h2>
            <p style={{ margin: 0, fontSize: '13px' }}>Manage product suppliers and vendors</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="Search suppliers..."
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

          <button className="btn-agro btn-primary" onClick={handleAdd} style={{ height: '38px', padding: '0 16px' }}>
            <Plus size={18} /> Add Supplier
          </button>
        </div>

        <div style={{ padding: '10px' }}>
          <DataTable
            title="Suppliers"
            columns={columns}
            data={filteredData}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onView={handleView}
            hideControls={true}
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier?"
        message={`Are you sure you want to delete ${currentItem?.name}?`}
      />
    </div>
  );
};

export default SupplierList;
