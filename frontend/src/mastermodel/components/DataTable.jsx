import React from 'react';
import { Edit2, Trash2, Eye, Search, Filter } from 'lucide-react';

const DataTable = ({ columns, data, onEdit, onDelete, onView, title, hideControls }) => {
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

  return (
    <div className="data-table-simple">
      {!hideControls && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '15px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder={`Search ${title || 'data'}...`} 
              className="form-control" 
              style={{ paddingLeft: '48px', borderRadius: '12px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', width: '160px' }}>
              <select 
                className="form-control" 
                style={{ paddingLeft: '15px', borderRadius: '12px', appearance: 'none', cursor: 'pointer', background: '#f9fafb' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Filter size={14} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      )}
      
      <div className="agro-table-container">
        <table className="agro-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.header}</th>
              ))}
              <th style={{ textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                  <td style={{ textAlign: 'left' }}>
                    <div className="action-icons" style={{ justifyContent: 'flex-start' }}>
                      {onView && (
                        <button className="action-btn btn-view" onClick={() => onView(row)} title="View Details">
                          <Eye size={18} />
                        </button>
                      )}
                      {onEdit && (
                        <button className="action-btn btn-edit" onClick={() => onEdit(row)} title="Edit Record">
                          <Edit2 size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button className="action-btn btn-delete" onClick={() => onDelete(row)} title="Delete Record">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: '15px', opacity: 0.3 }}><Search size={48} /></div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>No records found</div>
                  <div style={{ fontSize: '13px' }}>Try adjusting your search or filters</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
