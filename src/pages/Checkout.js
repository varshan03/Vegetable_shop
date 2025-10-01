import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../server';

export default function Checkout(){
  const nav = useNavigate();
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  async function placeOrder(){
    if (!user) { alert('Login required'); nav('/login'); return; }
    const items = cart.map(it => ({ product_id: it.product_id, quantity: it.quantity, price: it.price }));
    try {
      const res = await fetch(`${config.baseURL}/api/orders`, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ customer_id: user.id, items })
      });
      if (!res.ok) {
        const t = await res.json();
        throw new Error(t.error || 'Order failed');
      }
      const r = await res.json();
      localStorage.removeItem('cart');
      alert('Order placed! ID ' + r.orderId);
      nav('/');
    } catch(err){ alert(err.message); }
  }

  const total = cart.reduce((s,i)=> s + i.quantity * i.price, 0);

  return (
    <div className="card">
      <h3>Checkout</h3>
      <div>Items: {cart.length}</div>
      <div>Total: ₹{total.toFixed(2)}</div>
      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}
