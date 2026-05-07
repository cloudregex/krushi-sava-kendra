import React, { useEffect, useLayoutEffect } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Search, UserCircle, LogOut, User, Store } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainContentRef = React.useRef(null);
  const { user, hasPermission, logout } = useAuth();

  // Note: Scroll resets are now handled structurally via React keys on the scroll container.

  const [searchQuery, setSearchQuery] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Sidebar Menu Items for Search
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Business Profile', path: '/profile' },
    { name: 'User Profile', path: '/user-profile' },
    { name: 'Category', path: '/categories', module: 'category', action: 'view' },
    { name: 'Units', path: '/units', module: 'category', action: 'view' },
    { name: 'Products', path: '/products', module: 'product', action: 'view' },
    { name: 'Customers', path: '/customers', module: 'customer', action: 'view' },
    { name: 'Suppliers', path: '/suppliers', module: 'supplier', action: 'view' },
    { name: 'Stock', path: '/stock', module: 'stock', action: 'view' },
    { name: 'Billing', path: '/billing', module: 'billing', action: 'view' },
    { name: 'Sale Bill', path: '/sales/entry', module: 'sale', action: 'view' },
    { name: 'Quotation', path: '/sales/quotations', module: 'sale', action: 'view' },
    { name: 'Sale Return', path: '/sales/returns', module: 'sale', action: 'view' },
    { name: 'Purchase Bill', path: '/purchase/entry', module: 'purchase', action: 'view' },
    { name: 'Purchase Order', path: '/purchase/orders', module: 'purchase', action: 'view' },
    { name: 'Purchase Return', path: '/purchase/returns', module: 'purchase', action: 'view' },
    { name: 'Tax', path: '/tax', module: 'tax', action: 'view' },
    { name: 'Users', path: '/users', module: 'users', action: 'manage' },
    { name: 'Roles', path: '/roles', module: 'roles', action: 'manage' },
  ];

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filtered = menuItems.filter(item =>
        item.name.toLowerCase().startsWith(query.toLowerCase()) &&
        (!item.module || hasPermission(item.module, item.action))
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle Suggestion Click
  const handleSuggestionClick = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSuggestions(false);
    setIsSidebarOpen(false); // Close sidebar on navigation if it was open on mobile
  };

  // Map URL paths to modules
  const getModuleFromPath = (path) => {
    if (path.includes('/products')) return 'product';
    if (path.includes('/categories')) return 'category';
    if (path.includes('/units')) return 'category';
    if (path.includes('/customers')) return 'customer';
    if (path.includes('/suppliers')) return 'supplier';
    if (path.includes('/sales')) return 'sale';
    if (path.includes('/purchase')) return 'purchase';
    if (path.includes('/tax')) return 'tax';
    if (path.includes('/users')) return 'users';
    if (path.includes('/roles')) return 'roles';
    return null;
  };

  const currentModule = getModuleFromPath(location.pathname);

  // Safety redirect check logic
  const shouldRedirect = currentModule && !hasPermission(currentModule, 'view') && 
    !((currentModule === 'roles' || currentModule === 'users') && hasPermission(currentModule, 'manage'));

  // Generate permission classes
  const permissionClasses = currentModule ? [
    !hasPermission(currentModule, 'create') ? 'perm-no-create' : '',
    !hasPermission(currentModule, 'edit') ? 'perm-no-edit' : '',
    !hasPermission(currentModule, 'delete') ? 'perm-no-delete' : ''
  ].join(' ') : '';

  // Global Interceptor to stop clicks on disabled buttons and add tooltips
  useEffect(() => {
    const handleGlobalInteraction = (e) => {
      const target = e.target.closest('.perm-no-create .btn-primary, .perm-no-create .btn-agro.btn-primary, .perm-no-edit [title="Edit"], .perm-no-delete [title="Delete"], .perm-no-edit .btn-agro:has(svg.lucide-edit-2), .perm-no-delete .btn-agro:has(svg.lucide-trash-2)');

      if (target) {
        // Add tooltip if not already present
        if (target.getAttribute('title') !== 'Permission Required') {
          target.setAttribute('title', 'Permission Required');
        }

        if (e.type === 'click') {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('click', handleGlobalInteraction, true);
    document.addEventListener('mouseover', handleGlobalInteraction, true);

    return () => {
      document.removeEventListener('click', handleGlobalInteraction, true);
      document.removeEventListener('mouseover', handleGlobalInteraction, true);
    };
  }, [permissionClasses]);

  // Determine if current page is a create/entry page that should be fullscreen
  const isFullScreenPage = location.pathname.endsWith('/new') ||
    location.pathname.endsWith('/entry') ||
    location.pathname.includes('/view/');

  if (shouldRedirect) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className={`layout-container ${permissionClasses}`} style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>
        {`
          /* Permission Enforcement - Disabled State */
          .perm-no-create .btn-agro.btn-primary, .perm-no-create .btn-primary {
            opacity: 0.5 !important;
            filter: grayscale(0.8) !important;
            cursor: not-allowed !important;
          }
          
          .perm-no-edit button[title="Edit"], .perm-no-edit .btn-agro:has(svg.lucide-edit-2),
          .perm-no-edit [title="Edit"], .perm-no-edit [aria-label="Edit"] {
            opacity: 0.4 !important;
            filter: grayscale(1) !important;
            cursor: not-allowed !important;
          }
          
          .perm-no-delete button[title="Delete"], .perm-no-delete .btn-agro:has(svg.lucide-trash-2),
          .perm-no-delete [title="Delete"], .perm-no-delete [aria-label="Delete"] {
            opacity: 0.4 !important;
            filter: grayscale(1) !important;
            cursor: not-allowed !important;
          }

          /* Responsive Styles */
          @media (max-width: 768px) {
            .sidebar-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(4px);
              z-index: 150;
            }

            .sidebar-wrapper {
              position: fixed;
              left: 0;
              top: 0;
              bottom: 0;
              width: 280px;
              z-index: 200;
              transform: translateX(-100%);
              transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .sidebar-wrapper.open {
              transform: translateX(0);
            }

            .navbar-search-container {
              display: none !important; /* Hide search on mobile in top bar */
            }

            .header-user-info {
              display: none !important;
            }
          }
        `}
      </style>

      {!isFullScreenPage && (
        <>
          <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
          {isSidebarOpen && (
            <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
          )}
        </>
      )}

      <main className="main-content" style={{
        flex: 1,
        overflow: 'hidden',
        padding: '0',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh'
      }}>

        {/* Top Navbar */}
        {!isFullScreenPage && (
          <header style={{
            minHeight: '65px',
            height: '65px',
            margin: '0',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            borderRadius: '0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
            zIndex: 100,
            borderBottom: '2px solid rgba(16, 185, 129, 0.1)'
          }}>
            {/* Mobile Menu Toggle */}
            <div 
              style={{ display: 'none' }} 
              className="mobile-menu-toggle" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Search size={24} style={{ display: 'none' }} /> {/* Placeholder for hamburger */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ cursor: 'pointer', color: 'var(--primary)' }}
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </div>

            <style>
              {`
                @media (max-width: 768px) {
                  .mobile-menu-toggle {
                    display: block !important;
                  }
                }
              `}
            </style>

            {/* Search Section on the Left */}
            <div className="navbar-search-container" style={{ flex: 2, display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                  style={{
                    width: '100%',
                    padding: '10px 20px 10px 48px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid #e2e8f0',
                    fontSize: '15px',
                    fontWeight: '500',
                    color: 'var(--text-main)',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                />
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    zIndex: 100,
                    overflow: 'hidden',
                    padding: '8px'
                  }}>
                    {suggestions.map((item) => (
                      <div
                        key={item.path}
                        onClick={() => handleSuggestionClick(item.path)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text-main)',
                          transition: 'background 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>{item.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>Go to page →</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Close suggestions when clicking outside */}
                {showSuggestions && (
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
                    onClick={() => setShowSuggestions(false)}
                  />
                )}
                <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  <Search size={20} color="var(--text-muted)" />
                </div>
              </div>
            </div>

            {/* Spacer Middle */}
            <div style={{ flex: 1 }}></div>

            {/* User Profile / Dropdown Section */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
              <div className="header-user-info" style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{user?.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>{user?.role?.toUpperCase()}</p>
              </div>

              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'var(--primary)',
                  fontWeight: '800',
                  fontSize: '16px',
                  background: 'white',
                  boxShadow: showUserDropdown ? '0 0 15px rgba(22, 163, 74, 0.2)' : 'none'
                }}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>

              <AnimatePresence>
                {showUserDropdown && (
                  <>
                    <div 
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }}
                      onClick={() => setShowUserDropdown(false)}
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      style={{
                        position: 'absolute',
                        top: '110%',
                        right: 0,
                        width: '200px',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                        border: '1px solid #f1f5f9',
                        zIndex: 99,
                        overflow: 'hidden',
                        padding: '6px'
                      }}
                    >
                      <div 
                        onClick={() => { navigate('/user-profile'); setShowUserDropdown(false); }}
                        style={{ padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <User size={16} color="var(--primary)" />
                        <span>User Profile</span>
                      </div>

                      <div 
                        onClick={() => { navigate('/profile'); setShowUserDropdown(false); }}
                        style={{ padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Store size={16} color="var(--primary)" />
                        <span>Business Profile</span>
                      </div>

                      <div style={{ margin: '6px 0', borderTop: '1px solid #f1f5f9' }} />

                      <div 
                        onClick={() => { logout(); setShowUserDropdown(false); }}
                        style={{ padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#ef4444' }}
                        onMouseOver={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </header>
        )}

        {/* Isolated Scroll Container for Content */}
        <div 
          key={location.pathname}
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '0', flex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Outlet />
            </motion.div>
          </div>

          {!isFullScreenPage && <Footer />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
