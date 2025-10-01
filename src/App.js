import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CustomerHome from './pages/CustomerHome';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryApp from './pages/DeliveryApp';
import './App.css';

function App(){
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/" element={ user ? <CustomerHome/> : <Navigate to="/login" /> } />
        <Route path="/cart" element={ user ? <Cart/> : <Navigate to="/login" /> } />
        <Route path="/checkout" element={ user ? <Checkout/> : <Navigate to="/login" /> } />
        <Route path="/admin" element={ user && user.role==='admin' ? <AdminDashboard/> : <Navigate to="/login" /> } />
        <Route path="/delivery" element={ user && user.role==='delivery' ? <DeliveryApp/> : <Navigate to="/login" /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
