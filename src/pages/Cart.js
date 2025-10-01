// frontend/src/pages/Cart.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "customer") {
      nav("/login");
      return;
    }
    loadCart();
  }, []);

  function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(savedCart);
    updateTotal(savedCart);
  }

  function updateTotal(items) {
    const t = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    setTotal(t);
  }

  function changeQty(id, delta) {
    const updated = cart.map((item) =>
      item.id === id
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    updateTotal(updated);
  }

  function removeItem(id) {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    updateTotal(updated);
  }

  async function checkout() {
    if (cart.length === 0) return alert("Cart is empty!");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          items: cart,
          total_price: total,
        }),
      });
      if (res.ok) {
        localStorage.removeItem("cart");
        alert("Order placed successfully!");
        nav("/orders");
      } else {
        alert("Checkout failed.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  }

  return (
    <div className="container">
      <h2>Your Cart</h2>
      {cart.length === 0 ? (
        <p>No items in cart.</p>
      ) : (
        <div className="grid">
          {cart.map((item) => (
            <div key={item.id} className="product-card">
              <img src={item.image} alt={item.name} />
              <h4>{item.name}</h4>
              <p>₹{item.price} x {item.qty}</p>
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button onClick={() => changeQty(item.id, -1)}>-</button>
                <span>{item.qty}</span>
                <button onClick={() => changeQty(item.id, +1)}>+</button>
                <button onClick={() => removeItem(item.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Total: ₹{total}</h3>
          <button onClick={checkout}>Checkout</button>
        </div>
      )}
    </div>
  );
}
