import React from 'react';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './mastermodel/components/ScrollToTop';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './adminauth/context/AuthContext';
import Layout from './adminauth/components/Layout';
import ProtectedRoute from './adminauth/components/ProtectedRoute';
import Login from './adminauth/pages/auth/Login';
import AdminRegister from './adminauth/pages/auth/AdminRegister';
import Dashboard from './adminauth/pages/dashboard/Dashboard';
import RoleManagement from './adminauth/pages/dashboard/RoleManagement';
import RoleCreate from './adminauth/pages/dashboard/RoleCreate';
import UserManagement from './adminauth/pages/dashboard/UserManagement';
import UserCreate from './adminauth/pages/dashboard/UserCreate';
import BusinessProfile from './adminauth/pages/dashboard/BusinessProfile';
import UserProfile from './adminauth/pages/dashboard/UserProfile';
import ActivityLogs from './adminauth/pages/dashboard/ActivityLogs';
import ModulePage from './adminauth/pages/dashboard/ModulePage';
import {
  Suppliers, SupplierCreate, SupplierEdit, SupplierView,
  Customers, CustomerCreate, CustomerEdit, CustomerView,
  Categories, CategoryCreate, CategoryEdit,
  Taxes, TaxCreate, TaxEdit,
  Products, ProductCreate, ProductEdit, ProductView,
  Units, UnitCreate, UnitEdit
} from './mastermodel/pages';

import SaleBill from './sales/SaleBill';
import SaleEntry from './sales/SaleEntry';
import Quotation from './sales/Quotation';
import NewQuotation from './sales/NewQuotation';
import SaleReturn from './sales/SaleReturn';
import NewSaleReturn from './sales/NewSaleReturn';
import ViewSaleReturn from './sales/ViewSaleReturn';
import ViewSaleBill from './sales/ViewSaleBill';
import EditSaleBill from './sales/EditSaleBill';

import PurchaseBill from './purchase/PurchaseBill';
import ViewPurchaseBill from './purchase/ViewPurchaseBill';
import PurchaseEntry from './purchase/PurchaseEntry';
import PurchaseOrder from './purchase/PurchaseOrder';
import NewPurchaseOrder from './purchase/NewPurchaseOrder';
import ViewPurchaseOrder from './purchase/ViewPurchaseOrder';
import PurchaseReturn from './purchase/PurchaseReturn';
import NewPurchaseReturn from './purchase/NewPurchaseReturn';
import ViewPurchaseReturn from './purchase/ViewPurchaseReturn';
import StockMaster from './stock/StockMaster';
import StockChild from './stock/StockChild';
import ExpiryTracking from './stock/ExpiryTracking';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-admin" element={<AdminRegister />} />

      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="activity-logs" element={<ActivityLogs />} />

        {/* Master Model Routes */}
        <Route path="products">
          <Route index element={<Products />} />
          <Route path="create" element={<ProductCreate />} />
          <Route path="edit/:id" element={<ProductEdit />} />
          <Route path="view/:id" element={<ProductView />} />
        </Route>
        <Route path="customers">
          <Route index element={<Customers />} />
          <Route path="create" element={<CustomerCreate />} />
          <Route path="edit/:id" element={<CustomerEdit />} />
          <Route path="view/:id" element={<CustomerView />} />
        </Route>

        <Route path="suppliers">
          <Route index element={<Suppliers />} />
          <Route path="create" element={<SupplierCreate />} />
          <Route path="edit/:id" element={<SupplierEdit />} />
          <Route path="view/:id" element={<SupplierView />} />
        </Route>

        <Route path="categories">
          <Route index element={<Categories />} />
          <Route path="create" element={<CategoryCreate />} />
          <Route path="edit/:id" element={<CategoryEdit />} />
        </Route>
        <Route path="taxes">
          <Route index element={<Taxes />} />
          <Route path="create" element={<TaxCreate />} />
          <Route path="edit/:id" element={<TaxEdit />} />
        </Route>
        <Route path="units">
          <Route index element={<Units />} />
          <Route path="create" element={<UnitCreate />} />
          <Route path="edit/:id" element={<UnitEdit />} />
        </Route>

        <Route path="sales">
          <Route path="bills" element={<SaleBill />} />
          <Route path="bills/view/:id" element={<ViewSaleBill />} />
          <Route path="bills/edit/:id" element={<EditSaleBill />} />
          <Route path="entry" element={<SaleEntry />} />
          <Route path="quotations" element={<Quotation />} />
          <Route path="quotations/new" element={<NewQuotation />} />
          <Route path="returns" element={<SaleReturn />} />
          <Route path="returns/new" element={<NewSaleReturn />} />
          <Route path="returns/view/:id" element={<ViewSaleReturn />} />
          <Route index element={<ModulePage title="Sales" module="sale" />} />
        </Route>

        {/* Purchase Routes */}
        <Route path="purchase">
          <Route path="bills" element={<PurchaseBill />} />
          <Route path="bills/view/:id" element={<ViewPurchaseBill />} />
          <Route path="entry" element={<PurchaseEntry />} />
          <Route path="orders" element={<PurchaseOrder />} />
          <Route path="orders/new" element={<NewPurchaseOrder />} />
          <Route path="orders/view/:id" element={<ViewPurchaseOrder />} />
          <Route path="returns" element={<PurchaseReturn />} />
          <Route path="returns/new" element={<NewPurchaseReturn />} />
          <Route path="returns/view/:id" element={<ViewPurchaseReturn />} />
          <Route index element={<ModulePage title="Purchases" module="purchase" />} />
        </Route>

        {/* Stock Routes */}
        <Route path="stock">
          <Route index element={<Navigate to="master" />} />
          <Route path="master" element={<StockMaster />} />
          <Route path="child" element={<StockChild />} />
          <Route path="expiry" element={<ExpiryTracking />} />
        </Route>

        <Route path="roles">
          <Route index element={
            <ProtectedRoute module="roles" action="manage">
              <RoleManagement />
            </ProtectedRoute>
          } />
          <Route path="create" element={
            <ProtectedRoute module="roles" action="manage">
              <RoleCreate />
            </ProtectedRoute>
          } />
          <Route path="edit/:id" element={
            <ProtectedRoute module="roles" action="manage">
              <RoleCreate />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="users">
          <Route index element={
            <ProtectedRoute module="users" action="manage">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="create" element={
            <ProtectedRoute module="users" action="manage">
              <UserCreate />
            </ProtectedRoute>
          } />
          <Route path="edit/:id" element={
            <ProtectedRoute module="users" action="manage">
              <UserCreate />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="profile" element={<BusinessProfile />} />
        <Route path="user-profile" element={<UserProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/register-admin" />} />
    </Routes>
  );
};


function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <ScrollToTop />
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;
