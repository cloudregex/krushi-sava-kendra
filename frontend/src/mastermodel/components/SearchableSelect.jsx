import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X } from 'lucide-react';

const SearchableSelect = ({ label, options, value, onChange, placeholder, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(value || '');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef, value]);

  // Update search term when value changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Calculate position when opening
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  const isSearching = isOpen && searchTerm !== value;
  
  const filteredOptions = isSearching 
    ? options.filter(opt => String(opt).toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const handleSelect = (opt) => {
    setSearchTerm(opt);
    onChange({ target: { name: label.toLowerCase(), value: opt } });
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange({ target: { name: label.toLowerCase(), value: '' } });
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const dropdown = isOpen ? createPortal(
    <div style={{
      position: 'absolute',
      top: dropdownPos.top,
      left: dropdownPos.left,
      width: dropdownPos.width,
      zIndex: 9999,
      background: 'white',
      border: '1px solid var(--border-light)',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      maxHeight: '250px',
      overflowY: 'auto',
      padding: '6px'
    }}>
      {filteredOptions.length > 0 ? (
        filteredOptions.map((opt, i) => (
          <div 
            key={i}
            onClick={() => handleSelect(opt)}
            style={{
              padding: '10px 14px',
              cursor: 'pointer',
              borderRadius: '8px',
              marginBottom: '2px',
              background: selectedIndex === i ? 'var(--primary-soft)' : (value === opt ? '#f8fafc' : 'transparent'),
              color: selectedIndex === i || value === opt ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: selectedIndex === i || value === opt ? '700' : '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={() => setSelectedIndex(i)}
          >
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: value === opt ? 'var(--primary)' : (selectedIndex === i ? 'var(--primary-soft)' : '#e2e8f0') 
            }}></div>
            <span style={{ fontSize: '14px' }}>{opt}</span>
          </div>
        ))
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          No results found
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="form-group" style={{ position: 'relative' }} ref={wrapperRef}>
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <span>{label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}</span>
      </label>
      
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder={placeholder || `Select ${label}`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => { setIsOpen(true); setSearchTerm(''); }}
          onClick={() => { setIsOpen(true); setSearchTerm(''); }}
          onKeyDown={handleKeyDown}
          required={required}
          style={{ 
            paddingRight: '60px', 
            borderRadius: '12px',
            borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
            boxShadow: isOpen ? '0 0 0 4px var(--primary-soft)' : 'none',
            background: '#f9fafb',
            transition: 'all 0.3s',
            cursor: 'text'
          }}
        />
        
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            position: 'absolute', 
            right: '15px', 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center', 
            color: isOpen ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          {searchTerm && <X size={16} onClick={(e) => { e.stopPropagation(); handleClear(); }} style={{ cursor: 'pointer' }} />}
          <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
        </div>
      </div>

      {dropdown}
    </div>
  );
};

export default SearchableSelect;
