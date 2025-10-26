import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerHome from './pages/CustomerHome';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import DeliveryApp from './pages/DeliveryApp';
import Orders from './pages/Orders';
import DeliveryTracking from './pages/DeliveryTracking';
import OrderDetails from './pages/OrderDetails';
import './App.css';

function App(){
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/customer" element={<CustomerHome/>} />
        <Route path="/" element={ <Navigate to="/login" /> } />
        <Route path="/cart" element={ user ? <Cart/> : <Navigate to="/login" /> } />
        <Route path="/checkout" element={ user ? <Checkout/> : <Navigate to="/login" /> } />
        <Route path="/admin" element={ user && user.role === 'admin' ? <AdminDashboard/> : <Navigate to="/" /> } />
        <Route path="/admin/orders" element={ user && user.role === 'admin' ? <AdminOrders/> : <Navigate to="/" /> } />
        <Route path="/delivery" element={ <DeliveryApp/>  } />
        <Route path="/orders" element={ user ? <Orders/> : <Navigate to="/login" /> } />
        <Route path="/admin/orders/:orderId" element={ user ? <OrderDetails/> : <Navigate to="/login" /> } />
        <Route path="/track/:orderId" element={ user ? <DeliveryTracking/> : <Navigate to="/login" /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
