import React from 'react';

const FormField = ({ label, name, type = 'text', value, onChange, placeholder, required, options, isToggle, hint, hintColor, noLabel, noMargin }) => {
  if (isToggle) {
    return (
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input 
          type="checkbox" 
          name={name}
          checked={value}
          onChange={e => onChange({ target: { name, value: e.target.checked } })}
          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#16a34a' }}
        />
        <label style={{ margin: 0 }}>{label}</label>
      </div>
    );
  }

  return (
    <div className="form-group" style={{ marginBottom: noMargin ? '0' : '8px' }}>
      {!noLabel && (
        <div style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '5px' }}>
          <label style={{ margin: 0, display: 'inline-block' }}>
            {label} {required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
          </label>
          {hint && (
            <span style={{ 
              fontSize: '10px', 
              color: hintColor || '#16a34a', 
              fontWeight: '700', 
              background: hintColor ? `${hintColor}10` : '#f0fdf4', 
              padding: '2px 8px', 
              borderRadius: '10px',
              border: `1px solid ${hintColor ? `${hintColor}30` : '#dcfce7'}`,
              whiteSpace: 'nowrap'
            }}>
              {hint}
            </span>
          )}
        </div>
      )}
      {type === 'select' ? (
        <select 
          className="form-control" 
          name={name} 
          value={value} 
          onChange={onChange}
          required={required}
        >
          <option value="">Select {label}</option>
          {options?.map((opt, i) => {
            const val = typeof opt === 'object' ? (opt.id || opt.value || opt.name) : opt;
            const labelStr = typeof opt === 'object' ? (opt.name || opt.label) : opt;
            return <option key={i} value={val}>{labelStr}</option>;
          })}
        </select>
      ) : type === 'textarea' ? (
        <textarea 
          className="form-control" 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder}
          required={required}
          rows={3}
        />
      ) : (
        <input 
          type={type} 
          className="form-control" 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
};

export default FormField;
