import React, { useEffect, useState } from 'react';
import ProductCard from '../Components/ProductCard';
import { useNavigate } from 'react-router-dom';
import config from '../server';

export default function CustomerHome(){
  const [products, setProducts] = useState([]);
  const nav = useNavigate();

  useEffect(()=>{ fetchProducts(); }, []);
  async function fetchProducts(){
    const res = await fetch(`${config.baseURL}/api/products`);
    const data = await res.json();
    setProducts(data);
  }

  function addToCart(product){
    const cart = JSON.parse(localStorage.getItem('cart')||'[]');
    const existing = cart.find(i=>i.product_id===product.id);
    if (existing) existing.quantity++;
    else cart.push({ product_id: product.id, name: product.name, price: product.price, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart');
  }

  return (
    <div className="container">
      <header className="topbar">
        <h2>Vegetable Shop</h2>
        <div>
          <button onClick={()=>nav('/cart')}>Cart</button>
          <button onClick={()=>{ localStorage.removeItem('user'); nav('/login'); }}>Logout</button>
        </div>
      </header>
      <div className="grid">
        {products.map(p=> <ProductCard key={p.id} p={p} onAdd={addToCart} />)}
      </div>
    </div>
  );
}
