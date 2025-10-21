// frontend/src/pages/Cart.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, InputNumber, message, Card, Input } from "antd";
import { DeleteOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import config from "../server";
import "../theme.css";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const { Title, Text } = Typography;
  const { TextArea } = Input;
  const [total, setTotal] = useState(0);
  const [address, setAddress] = useState("");
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
    console.log(cart);
    
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
    const t = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    setTotal(t);
  }

  function changeQty(id, value) {
    const updated = cart.map((item) =>
      item.product_id === id ? { ...item, quantity: value } : item
    );
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    updateTotal(updated);
  }

  function removeItem(id) {
    const updated = cart.filter((item) => item.product_id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    updateTotal(updated);
    message.info("Item removed from cart");
  }

  async function checkout() {
    if (cart.length === 0) return message.warning("Cart is empty!");

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const res = await fetch(`${config.baseURL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            items: cart,
            total_price: total,
            latitude,
            longitude,
            address,
          }),
        });
        if (res.ok) {
          localStorage.removeItem("cart");
          message.success("Order placed successfully!");
          nav("/orders");
        } else {
          message.error("Checkout failed.");
        }
      } catch (err) {
        console.error("Checkout error:", err);
        message.error("Something went wrong.");
      }
    }, (error) => {
      console.error("Error getting location:", error);
      message.error("Could not get your location. Please enable location services.",error);
    });
  }

  return (
    <div className="cart-container">
      <Title level={2} className="cart-title"><ShoppingCartOutlined /> Your Cart</Title>
      {cart.length === 0 ? (
        <Card className="empty-cart-card">
          <Text>Your cart is empty. Start shopping!</Text>
        </Card>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <Card key={item.product_id} className="cart-item-card">
                <div className="cart-item-content">
                  <img src={`${config.baseURL}${item.image_url}`} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <Title level={5}>{item.name}</Title>
                    <Text>Price: ₹{item.price}</Text>
                    <div className="cart-item-actions">
                      <InputNumber
                        min={1}
                        value={item.quantity}
                        onChange={(value) => changeQty(item.product_id, value)}
                      />
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeItem(item.product_id)}
                      />
                    </div>
                  </div>
                  <div className="cart-item-subtotal">
                    <Text>Subtotal: ₹{item.price * item.quantity}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="cart-summary">
            <Card>
              <Title level={4}>Order Summary</Title>
              <div className="summary-row">
                <Text>Subtotal</Text>
                <Text>₹{total}</Text>
              </div>
              <div className="summary-row">
                <Text>Shipping</Text>
                <Text>Free</Text>
              </div>
              <div className="summary-row total-row">
                <Title level={5}>Total</Title>
                <Title level={5}>₹{total}</Title>
              </div>
              <TextArea 
                rows={4} 
                placeholder="Enter your delivery address" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                style={{ marginBottom: '16px' }}
              />
              <Button type="primary" size="large" block onClick={() => nav('/checkout')}>
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
