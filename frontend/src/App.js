// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerOrders from './pages/manager/Orders';

// Customer Pages
import Products from './pages/customer/Products';
import CustomerOrders from './pages/customer/Orders';
import Checkout from './pages/customer/Checkout';
import Cart from './components/cart/Cart';

// Component to handle default redirection based on role
const DefaultRedirect = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Redirect based on user role
  switch(user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'manager':
      return <Navigate to="/manager" replace />;
    case 'customer':
      return <Navigate to="/products" replace />;
    default:
      return <Navigate to="/unauthorized" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Default route - redirects based on user role */}
            <Route path="/" element={<DefaultRedirect />} />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Manager Routes */}
            <Route path="/manager/*" element={
              <ProtectedRoute allowedRoles={['manager', 'admin']}>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<ManagerDashboard />} />
                    <Route path="orders" element={<ManagerOrders />} />
                    <Route path="*" element={<Navigate to="/manager" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Customer Routes */}
            <Route path="/*" element={
              <ProtectedRoute allowedRoles={['customer', 'admin', 'manager']}>
                <DashboardLayout>
                  <Routes>
                    <Route index element={<Products />} />
                    <Route path="products" element={<Products />} />
                    <Route path="my-orders" element={<CustomerOrders />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="cart" element={<Cart mode="page" />} />
                    <Route path="*" element={<Navigate to="/products" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
          
          {/* Global Cart Drawer */}
          <Cart mode="drawer" />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;