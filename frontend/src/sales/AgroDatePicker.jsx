import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';

const AgroDatePicker = ({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = "Select Date",
  height = "36px",
  style = {},
  className = "",
  align = "left",
  tabIndex
}) => {
  const inputRef = useRef(null);

  const handleWrapperClick = () => {
    if (disabled || readOnly) return;
    if (inputRef.current) {
      try {
        // Programmatically trigger browser native calendar popup
        if (typeof inputRef.current.showPicker === 'function') {
          inputRef.current.showPicker();
        } else {
          inputRef.current.focus();
        }
      } catch (e) {
        console.warn("showPicker not supported, fallback to focus", e);
        inputRef.current.focus();
      }
    }
  };

  return (
    <div
      onClick={handleWrapperClick}
      className={`agro-datepicker-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: disabled ? '#f1f5f9' : '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        height: height,
        padding: '0 12px',
        cursor: (disabled || readOnly) ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        ...style
      }}
      onMouseOver={(e) => {
        if (!disabled && !readOnly) {
          e.currentTarget.style.borderColor = '#94a3b8';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && !readOnly) {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <input
        ref={inputRef}
        type="date"
        value={value || ''}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        tabIndex={tabIndex}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '13px',
          color: value ? '#0f172a' : '#94a3b8',
          fontFamily: 'inherit',
          padding: 0,
          cursor: (disabled || readOnly) ? 'not-allowed' : 'pointer',
          textAlign: align,
          appearance: 'none',
          WebkitAppearance: 'none'
        }}
      />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: '8px',
        color: disabled ? '#94a3b8' : '#ef4444',
        pointerEvents: 'none'
      }}>
        <Calendar size={15} />
      </div>

      {/* Styled webkit calendar picker indicator override to hide default generic icon */}
      <style>{`
        .agro-datepicker-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: auto;
          height: auto;
          color: transparent;
          background: transparent;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default AgroDatePicker;
