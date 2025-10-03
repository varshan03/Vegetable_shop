// frontend/src/pages/CustomerHome.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col, Typography, message, Badge } from "antd";
import { ShoppingCartOutlined, LogoutOutlined, UnorderedListOutlined } from "@ant-design/icons";
import config from "../server";
import "../theme.css";
// import "../styles/CustomerHome.css";

const { Title } = Typography;

export default function CustomerHome() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    fetchProducts();
    updateCartCount();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch(`${config.baseURL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      message.error("Failed to load products");
    }
  }

  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
  }

  function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((i) => i.product_id === product.id);
    if (existing) existing.quantity++;
    else
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1,
      });
    localStorage.setItem("cart", JSON.stringify(cart));
    message.success(`${product.name} added to cart`);
    updateCartCount();
  }

  return (
    <div className="customer-container">
      {/* ---------- Header ---------- */}
      <header className="customer-header">
        <Title level={3} className="shop-title">
          🥦 Vegetable Shop
        </Title>
        <div className="header-actions">
          <Button
            type="primary"
            icon={<UnorderedListOutlined />}
            onClick={() => nav("/orders")}
            style={{ marginRight: "10px" }}
          >
            My Orders
          </Button>
          <Badge count={cartCount} offset={[0, 5]}>
            <Button
              type="primary"
              icon={<ShoppingCartOutlined />}
              onClick={() => nav("/cart")}
            >
              Cart
            </Button>
          </Badge>
          <Button
            type="default"
            danger
            icon={<LogoutOutlined />}
            onClick={() => {
              localStorage.removeItem("user");
              nav("/login");
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      {/* ---------- Product Grid ---------- */}
      <Row gutter={[16, 16]} className="product-grid">
        {products.map((p) => (
          <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              className="product-card"
              cover={
                <img
                  alt={p.name}
                  src={`${config.baseURL}${p.image_url}`}
                  className="product-image"
                />
              }
            >
              <Card.Meta
                title={p.name}
                description={`₹${p.price} | Stock: ${p.stock}`}
              />
              <Button
                type="primary"
                block
                style={{ marginTop: "10px" }}
                onClick={() => addToCart(p)}
                disabled={p.stock <= 0}
              >
                {p.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
