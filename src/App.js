import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerHome from './pages/CustomerHome';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import DeliveryApp from './pages/DeliveryApp';
import Orders from './pages/Orders';
import './App.css';

function App(){
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/" element={ user ? <CustomerHome/> : <Navigate to="/login" /> } />
        <Route path="/cart" element={ user ? <Cart/> : <Navigate to="/login" /> } />
        <Route path="/checkout" element={ user ? <Checkout/> : <Navigate to="/login" /> } />
        <Route path="/admin" element={ <AdminDashboard/> } />
        <Route path="/delivery" element={ <DeliveryApp/>  } />
        <Route path="/orders" element={ user ? <Orders/> : <Navigate to="/login" /> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
