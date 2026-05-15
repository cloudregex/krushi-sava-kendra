import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, X, Loader2 } from 'lucide-react';
import api from '../adminauth/utils/api';

const AsyncSupplierSelect = ({ value, onChange, placeholder = "Search Supplier...", style, height = '40px', padding = '0 12px', textColor = '#1e293b', bgColor = 'white' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fetch initial selected value if provided
  useEffect(() => {
    if (value && !selectedOption) {
      api.get(`/suppliers/${value}`).then(res => {
        setSelectedOption(res.data);
      }).catch(err => console.error("Error fetching supplier details", err));
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value]);

  const fetchSuppliers = async (query = '') => {
    setLoading(true);
    try {
      const endpoint = query 
        ? `/suppliers?q=${encodeURIComponent(query)}&limit=20` 
        : `/suppliers?limit=10`;
      const res = await api.get(endpoint);
      setOptions(res.data || []);
    } catch (err) {
      console.error("Error fetching suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    
    if (!isOpen) { 
      calcPos(); 
      setIsOpen(true); 
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      fetchSuppliers(val);
    }, 300); // 300ms debounce
  };

  const handleOpen = () => {
    if (!isOpen) {
      fetchSuppliers(''); // Fetch default 10 records
      setTimeout(() => {
        calcPos();
        setIsOpen(true);
      }, 0);
    }
  };

  const calcPos = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        const dropdown = document.getElementById('async-supplier-dropdown');
        if (dropdown && dropdown.contains(event.target)) return;
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => calcPos();
    const onResize = () => calcPos();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [isOpen]);

  const selectOption = (opt) => {
    setSelectedOption(opt);
    onChange(opt.id, opt);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      if (options[highlightedIndex]) selectOption(options[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedOption(null);
    onChange('', null);
    setSearchTerm('');
  };

  const dropdown = isOpen ? createPortal(
    <div
      id="async-supplier-dropdown"
      style={{
        position: 'absolute',
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        zIndex: 99999,
        maxHeight: '260px',
        overflowY: 'auto',
        boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
        border: '1px solid var(--border-light)',
        background: bgColor,
        padding: '6px',
        borderRadius: '12px',
      }}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#64748b' }}>
          <Loader2 size={18} className="spin-animation" style={{ marginRight: '8px' }} />
          <span style={{ fontSize: '13px' }}>Searching...</span>
        </div>
      ) : options.length > 0 ? (
        options.map((opt, idx) => (
          <div
            key={opt.id}
            style={{
              padding: '10px 14px',
              cursor: 'pointer',
              borderRadius: '8px',
              background: idx === highlightedIndex ? 'var(--primary-soft)' : (String(value) === String(opt.id) ? 'var(--primary-soft)' : 'transparent'),
              marginBottom: '2px',
              display: 'flex',
              flexDirection: 'column',
            }}
            onMouseEnter={() => setHighlightedIndex(idx)}
            onMouseDown={(e) => { e.preventDefault(); selectOption(opt); }}
          >
            <div style={{ fontWeight: '600', fontSize: '13px', color: String(value) === String(opt.id) ? 'var(--primary)' : textColor }}>
              {opt.name}
            </div>
            {(opt.mobile) && (
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span>📞 {opt.mobile}</span>
              </div>
            )}
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: '18px', color: '#9ca3af', fontSize: '13px' }}>
          No suppliers found
        </div>
      )}
      <style>{`
        .spin-animation { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', ...style }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'text',
          padding: padding,
          height: height,
          background: bgColor,
          borderRadius: '4px',
          border: isOpen ? '2px solid var(--primary)' : '1px solid var(--border)',
          transition: 'all 0.2s ease',
          boxShadow: isOpen ? '0 0 0 4px var(--primary-soft)' : 'none'
        }}
        onClick={handleOpen}
      >
        <Search size={15} style={{ flexShrink: 0, marginRight: '8px', color: isOpen ? 'var(--primary)' : '#9ca3af' }} />
        <input
          ref={inputRef}
          type="text"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: textColor,
            width: '100%',
            height: '100%',
            fontSize: '13px',
            lineHeight: height,
            padding: '0',
            margin: '0',
            fontWeight: selectedOption ? '700' : '500'
          }}
          placeholder={placeholder}
          value={isOpen ? searchTerm : (selectedOption ? selectedOption.name : '')}
          onChange={handleSearch}
          onFocus={handleOpen}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {value && !isOpen && (
          <div style={{ marginLeft: '6px', color: '#9ca3af', cursor: 'pointer' }} onClick={clearSelection}>
            <X size={14} />
          </div>
        )}
        {!value && !isOpen && (
          <ChevronDown size={15} style={{ marginLeft: '6px', opacity: 0.5, flexShrink: 0 }} />
        )}
      </div>
      {dropdown}
    </div>
  );
};

export default AsyncSupplierSelect;
