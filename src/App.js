import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerHome from './pages/CustomerHome';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import AdminOrders from './pages/AdminOrders';
import DeliveryApp from './pages/DeliveryApp';
import Orders from './pages/Orders';
import DeliveryTracking from './pages/DeliveryTracking';
import AccountSettings from './pages/AccountSettings';
import OrderDetails from './pages/OrderDetails';
import './App.css';
import HeaderBar from './Components/HeaderBar';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Listen for login/logout across tabs or direct localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('user');
      let next = null;
      try { next = saved ? JSON.parse(saved) : null; } catch { next = null; }
      setUser((prev) => {
        const same = JSON.stringify(prev) === JSON.stringify(next);
        return same ? prev : next;
      });
    };

    // Initial check
    handleStorageChange();

    // Listen for changes (e.g., login in another tab)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Optional: Also dispatch custom event from Login component
  useEffect(() => {
    const handleUserChange = () => {
      const saved = localStorage.getItem('user');
      let next = null;
      try { next = saved ? JSON.parse(saved) : null; } catch { next = null; }
      setUser((prev) => {
        const same = JSON.stringify(prev) === JSON.stringify(next);
        return same ? prev : next;
      });
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  function AppContent() {
    const location = useLocation();
    const hideGlobalHeader = location.pathname === '/customer' || location.pathname === '/login';
    return (
      <>
        {!hideGlobalHeader && <HeaderBar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Protected Routes */}
          <Route
            path="/customer"
            element={user ? <CustomerHome /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/cart"
            element={user ? <Cart /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/checkout"
            element={user ? <Checkout /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders"
            element={user ? <Orders /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/orders/:orderId"
            element={user ? <OrderDetails /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/acconts"
            element={user ? <AccountSettings /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/track/:orderId"
            element={user ? <DeliveryTracking /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/admin/orders/:orderId"
            element={user ? <OrderDetails /> : <Navigate to="/login" replace />}
          />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            user && user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/users"
          element={
            user && user.role === 'admin' ? (
              <Users />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/orders"
          element={
            user && user.role === 'admin' ? (
              <AdminOrders />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Delivery App - Allow without login? Or protect? */}
        <Route path="/delivery" element={<DeliveryApp />} />
        </Routes>
      </>
    );
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;