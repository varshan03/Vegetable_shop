// frontend/src/pages/CustomerHome.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col, Typography, message, Badge, Input, Select, Space } from "antd";
import { ShoppingCartOutlined, LogoutOutlined, UnorderedListOutlined } from "@ant-design/icons";
import config from "../server";
import "../theme.css";
// import "../styles/CustomerHome.css";

const { Title } = Typography;
const { Option } = Select;

export default function CustomerHome() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState();
  const nav = useNavigate();

  useEffect(() => {
    fetchProducts();
    updateCartCount();
  }, []);

  // Refetch when category changes to keep filter responsive
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  async function fetchProducts() {
    try {
      const params = new URLSearchParams();
      if (search) params.append("q", search);
      if (category) params.append("category", category);
      const qs = params.toString();
      const res = await fetch(`${config.baseURL}/api/products${qs ? `?${qs}` : ""}`);
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
        Vegetable Shop
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

      {/* ---------- Filters ---------- */}
      <div style={{ margin: "12px 0" }}>
        <Space>
          <Input.Search
            allowClear
            placeholder="Search products (name, desc, uom)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={fetchProducts}
            style={{ width: 280 }}
          />
          <Select
            allowClear
            placeholder="Category"
            value={category}
            onChange={(v) => setCategory(v)}
            style={{ width: 200 }}
          >
            <Option value="Vegetables">Vegetables</Option>
            <Option value="Stationers items">Stationers items</Option>
            <Option value="Banana Leaf">Banana Leaf</Option>
          </Select>
          <Button onClick={fetchProducts}>Refresh</Button>
        </Space>
      </div>

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
                description={`₹${p.price} / ${p.uom || 'unit'} | Stock: ${p.stock} | ${p.category || ''}`}
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
