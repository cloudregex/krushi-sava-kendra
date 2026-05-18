import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STORAGE_KEYS, getFromStorage } from '../../utils/storage';
import { 
  Package, ShoppingCart, Truck, Users, 
  ArrowUpRight, ArrowDownRight, Clock, 
  Plus, FileText, CreditCard, Layers,
  ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    products: 0,
    salesToday: 0,
    pendingPurchases: 0,
    users: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalRevenue: 0,
    monthlySales: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [categoryStock, setCategoryStock] = useState([]);

  const fetchData = () => {
    // Fetch Products & Categories
    const agroData = getFromStorage(STORAGE_KEYS.AGRO_DATA) || {};
    const products = agroData.products || [];
    const categories = agroData.categories || [];
    const productCount = products.length;

    // Fetch Users
    const users = getFromStorage(STORAGE_KEYS.USERS) || [];
    const userCount = users.length;

    // Fetch Sales
    const sales = getFromStorage(STORAGE_KEYS.SALES) || [];
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const todaySales = sales
      .filter(s => s.billDate === today)
      .reduce((sum, s) => sum + (parseFloat(s.grandTotal) || 0), 0);
    
    const monthlySales = sales
      .filter(s => s.billDate && s.billDate.startsWith(currentMonth))
      .reduce((sum, s) => sum + (parseFloat(s.grandTotal) || 0), 0);
    
    const totalRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.grandTotal) || 0), 0);

    // Fetch Purchases
    const purchases = getFromStorage(STORAGE_KEYS.PURCHASES) || [];
    const pendingCount = purchases.filter(p => (parseFloat(p.dueAmount) || 0) > 0).length;

    // Fetch Customers & Suppliers
    const customersCount = (agroData.customers || []).length;
    const suppliersCount = (agroData.suppliers || []).length;

    setStatsData({
      products: productCount,
      salesToday: todaySales,
      pendingPurchases: pendingCount,
      users: userCount,
      totalCustomers: customersCount,
      totalSuppliers: suppliersCount,
      totalRevenue: totalRevenue,
      monthlySales: monthlySales
    });

    // Stock by Category
    const stockStats = categories.map(cat => {
      const catProducts = products.filter(p => p.categoryId === cat.id);
      return {
        name: cat.name,
        count: catProducts.length,
        percentage: productCount > 0 ? (catProducts.length / productCount) * 100 : 0
      };
    }).sort((a, b) => b.count - a.count).slice(0, 4);

    setCategoryStock(stockStats);

    // Recent Activity
    const allActivity = [
      ...sales.map(s => ({ ...s, type: 'Sale', icon: <ShoppingCart size={16} />, color: '#10b981' })),
      ...purchases.map(p => ({ ...p, type: 'Purchase', icon: <Truck size={16} />, color: '#ef4444' }))
    ].sort((a, b) => new Date(b.billDate || b.createdAt) - new Date(a.billDate || a.createdAt))
     .slice(0, 5);

    setRecentActivity(allActivity);
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('storage', fetchData);
    const interval = setInterval(fetchData, 5000);
    return () => {
      window.removeEventListener('storage', fetchData);
      clearInterval(interval);
    };
  }, []);

  const stats = [
    { label: "Today's Sales", value: `₹${statsData.salesToday.toLocaleString()}`, icon: <TrendingUp size={24} />, color: '#10b981', trend: '+12%' },
    { label: 'Monthly Sales', value: `₹${statsData.monthlySales.toLocaleString()}`, icon: <Layers size={24} />, color: '#06b6d4', trend: 'Updated' },
    { label: 'Total Products', value: statsData.products, icon: <Package size={24} />, color: '#3b82f6' },
    { label: 'Total Customers', value: statsData.totalCustomers, icon: <Users size={24} />, color: '#8b5cf6' },
    { label: 'Total Suppliers', value: statsData.totalSuppliers, icon: <Truck size={24} />, color: '#f59e0b' },
    { label: 'Pending Purchases', value: statsData.pendingPurchases, icon: <AlertCircle size={24} />, color: '#ef4444' },
    { label: 'Total Revenue', value: `₹${statsData.totalRevenue.toLocaleString()}`, icon: <CreditCard size={24} />, color: '#06b6d4' },
  ];

  const quickActions = [
    { name: 'New Bill', icon: <Plus size={18} />, path: '/billing', module: 'billing', action: 'manage', color: '#10b981' },
    { name: 'Add Product', icon: <Package size={18} />, path: '/products', module: 'product', action: 'create', color: '#3b82f6' },
    { name: 'Reports', icon: <FileText size={18} />, path: '/sales/quotations', module: 'sale', action: 'view', color: '#8b5cf6' },
    { name: 'Users', icon: <Users size={18} />, path: '/users', module: 'users', action: 'manage', color: '#f59e0b' },
  ].filter(action => !action.module || hasPermission(action.module, action.action));

  return (
    <div className="agro-container">
      <style>
        {`
          .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }

          .content-split-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 25px;
            margin-bottom: 40px;
          }

          @media (max-width: 1024px) {
            .content-split-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .dashboard-grid {
              grid-template-columns: 1fr;
            }
            .activity-item {
              flex-direction: column;
              align-items: flex-start !important;
              gap: 10px;
            }
            .activity-amount {
              text-align: left !important;
            }
          }
        `}
      </style>
      <div>
      {/* Stats Grid */}
      <div className="dashboard-grid">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ 
              background: 'white',
              padding: '20px',
              borderRadius: '24px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 10px 25px -10px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                background: `${stat.color}15`, 
                color: stat.color, 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              {stat.trend && (
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', background: '#f0fdf4', padding: '3px 8px', borderRadius: '99px' }}>
                  {stat.trend}
                </span>
              )}
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </p>
              <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                {stat.value}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="content-split-grid">
        {/* Recent Activity */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          border: '1px solid #f1f5f9',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '25px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>Recent Activity</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Latest 5 transactions</p>
            </div>
            <button 
              onClick={() => navigate('/activity-logs')}
              style={{ padding: '8px 16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              View All
            </button>
          </div>
          
          <div style={{ padding: '15px 20px 25px' }}>
            {recentActivity.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '12px', 
                    borderRadius: '16px',
                    border: '1px solid #f8fafc',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ 
                        background: activity.color + '15', 
                        color: activity.color, 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center'
                      }}>
                        {activity.icon}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{activity.type === 'Sale' ? 'Sale' : 'Purchase'}</h4>
                        <p style={{ margin: '1px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>{activity.billDate} • Bill: {activity.billNo}</p>
                      </div>
                    </div>
                    <div className="activity-amount" style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: activity.type === 'Sale' ? '#10b981' : '#ef4444' }}>
                        {activity.type === 'Sale' ? '+' : '-'} ₹{(activity.grandTotal || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Clock size={32} style={{ opacity: 0.1, marginBottom: '10px' }} />
                <p style={{ fontSize: '13px', fontWeight: '600' }}>No transactions yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Inventory */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {/* Stock Inventory */}
          <div style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '25px',
            border: '1px solid #f1f5f9',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            height: '100%'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '20px' }}>Inventory Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {categoryStock.map((cat, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{cat.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>{cat.count} Items</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              ))}
              {categoryStock.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>No data available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
