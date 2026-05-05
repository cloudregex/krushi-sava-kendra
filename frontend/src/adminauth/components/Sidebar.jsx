import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  ShieldCheck,
  LogOut,
  Tags,
  UserCheck,
  Percent,
  UserPlus,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Box,
  Clock,
  AlertCircle,
  Store
} from 'lucide-react';

import logo from '../../assets/premium_logo.png';

const Sidebar = () => {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState({
    sales: location.pathname.startsWith('/sales'),
    purchase: location.pathname.startsWith('/purchase'),
    stock: location.pathname.startsWith('/stock')
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => {
      const isCurrentlyOpen = prev[group];
      // Reset all groups to false, then toggle only the clicked one
      return {
        sales: group === 'sales' ? !isCurrentlyOpen : false,
        purchase: group === 'purchase' ? !isCurrentlyOpen : false,
        stock: group === 'stock' ? !isCurrentlyOpen : false
      };
    });
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Category', icon: <Tags size={20} />, path: '/categories', module: 'category', action: 'view' },
    { name: 'Products', icon: <Package size={20} />, path: '/products', module: 'product', action: 'view' },
    { name: 'Customers', icon: <UserCheck size={20} />, path: '/customers', module: 'customer', action: 'view' },
    { name: 'Suppliers', icon: <Truck size={20} />, path: '/suppliers', module: 'supplier', action: 'view' },

    // Stock Group
    {
      name: 'Stock',
      icon: <Box size={20} />,
      id: 'stock',
      children: [
        { name: 'Stock Master', icon: <Package size={18} />, path: '/stock/master', module: 'stock', action: 'view' },
        { name: 'Stock Child', icon: <Box size={18} />, path: '/stock/child', module: 'stock', action: 'view' },
        { name: 'Expiry Tracking', icon: <Clock size={18} />, path: '/stock/expiry', module: 'stock', action: 'view' }
      ]
    },

    // Sales Group
    {
      name: 'Sales',
      icon: <ShoppingCart size={20} />,
      id: 'sales',
      children: [
        { name: 'Sale Bill', icon: <ShoppingCart size={18} />, path: '/sales/bills', module: 'sale', action: 'view' },
        { name: 'Quotation', icon: <FileText size={18} />, path: '/sales/quotations', module: 'sale', action: 'view' },
        { name: 'Sale Return', icon: <RotateCcw size={18} />, path: '/sales/returns', module: 'sale', action: 'view' },
      ]
    },

    // Purchase Group
    {
      name: 'Purchase',
      icon: <Truck size={20} />,
      id: 'purchase',
      children: [
        { name: 'Purchase Bill', icon: <FileText size={18} />, path: '/purchase/bills', module: 'purchase', action: 'view' },
        { name: 'Purchase Order', icon: <ClipboardList size={18} />, path: '/purchase/orders', module: 'purchase', action: 'view' },
        { name: 'Purchase Return', icon: <RotateCcw size={18} />, path: '/purchase/returns', module: 'purchase', action: 'view' },
      ]
    },

    { name: 'Tax', icon: <Percent size={20} />, path: '/taxes', module: 'tax', action: 'view' },
    { name: 'Users', icon: <UserPlus size={20} />, path: '/users', module: 'users', action: 'manage' },
    { name: 'Roles', icon: <ShieldCheck size={20} />, path: '/roles', module: 'roles', action: 'manage' },
    { name: 'User Profile', icon: <Users size={20} />, path: '/user-profile' },
    { name: 'Business Profile', icon: <Store size={20} />, path: '/profile' },
  ];

  const filterItem = (item) => {
    if (item.children) {
      const filteredChildren = item.children.filter(child => !child.module || hasPermission(child.module, child.action));
      return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
    }
    return !item.module || hasPermission(item.module, item.action) ? item : null;
  };

  const filteredMenu = menuItems.map(filterItem).filter(Boolean);

  return (
    <aside className="sidebar" style={{
      width: '280px',
      height: '100vh',
      background: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)',
      padding: '20px 15px',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
      zIndex: 100,
      position: 'relative'
    }}>
      <div className="brand" style={{ marginBottom: '20px', textAlign: 'left', padding: '0 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '55px',
            height: '55px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
            borderRadius: '16px', // Premium Squircle (Apple/iOS Style)
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.2)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(12px)', // Glass effect
            overflow: 'hidden'
          }}>
            <img src={logo} alt="AgroSeva Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.5px', margin: 0, color: 'white' }}>AGRO SEVA</h2>
            <p style={{ fontSize: '11px', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '2px' }}>Management System</p>
          </div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
        {filteredMenu.map((item) => (
          <div key={item.name + (item.path || '')}>
            {item.children ? (
              <>
                <div
                  onClick={() => toggleGroup(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    color: location.pathname.startsWith(`/${item.id}`) ? 'white' : 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    background: location.pathname.startsWith(`/${item.id}`) ? '#10b981' : 'transparent',
                    borderLeft: location.pathname.startsWith(`/${item.id}`) ? '4px solid #34d399' : '4px solid transparent'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = location.pathname.startsWith(`/${item.id}`) ? '#10b981' : 'rgba(255,255,255,0.1)';
                    if (!location.pathname.startsWith(`/${item.id}`)) e.currentTarget.style.borderLeft = '4px solid rgba(52, 211, 153, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = location.pathname.startsWith(`/${item.id}`) ? '#10b981' : 'transparent';
                    e.currentTarget.style.borderLeft = location.pathname.startsWith(`/${item.id}`) ? '4px solid #34d399' : '4px solid transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {item.icon}
                    <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.name}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: openGroups[item.id] ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <ChevronDown size={16} />
                  </motion.div>
                </div>

                <AnimatePresence initial={false}>
                  {openGroups[item.id] && (
                    <motion.div
                      key="content"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto", marginBottom: 10 },
                        collapsed: { opacity: 0, height: 0, marginBottom: 0 }
                      }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ paddingLeft: '20px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                              background: isActive ? '#059669' : 'transparent',
                              textDecoration: 'none',
                              transition: 'all 0.3s',
                              fontSize: '13px',
                              fontWeight: isActive ? '700' : '500',
                              borderLeft: isActive ? '3px solid #34d399' : '3px solid transparent'
                            })}
                          >
                            {child.icon}
                            <span>{child.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <NavLink
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.85)',
                  background: isActive ? '#10b981' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  fontWeight: isActive ? '700' : '600',
                  fontSize: '14px',
                  borderLeft: isActive ? '4px solid #34d399' : '4px solid transparent'
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
