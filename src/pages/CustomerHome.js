// frontend/src/pages/CustomerHome.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col, Typography, message, Badge, Input, Tag, Divider, Drawer } from "antd";
import { ShoppingCartOutlined, LogoutOutlined, UnorderedListOutlined, SearchOutlined, UserOutlined, HeartOutlined, StarFilled, MenuOutlined } from "@ant-design/icons";
import config from "../server";
import "../theme.css";
import logoImg from "../Images/logo.jpg";
// import "../styles/CustomerHome.css";

const { Title, Text } = Typography;

export default function CustomerHome() {
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Debounced search - fetch products when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
    <div className="ecommerce-container">
      {/* ---------- Top Navigation Bar ---------- */}
      <header className="ecommerce-header">
        <div className="header-top">
          <div className="logo-section">
            <img src={logoImg} alt="RR Fresh Delivery" className="company-logo" />
            <Text style={{marginTop:'3px'}} className="brand-tagline">Fresh & Organic</Text>
          </div>
          
          <div className="search-section">
            <Input
              size="large"
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              className="main-search-bar"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="header-actions desktop-nav">
            <Button 
              type="text" 
              icon={<UserOutlined />}
              className="header-btn"
              onClick={()=> nav("/acconts")}
            >
              <span className="btn-text">Account</span>
            </Button>
            <Button 
              type="text" 
              icon={<UnorderedListOutlined />}
              onClick={() => nav("/orders")}
              className="header-btn"
            >
              <span className="btn-text">Orders</span>
            </Button>
            <Badge count={cartCount} showZero>
              <Button 
                type="text" 
                icon={<ShoppingCartOutlined />}
                onClick={() => nav("/cart")}
                className="header-btn cart-btn"
              >
                <span className="btn-text">Cart</span>
              </Button>
            </Badge>
            <Button
              type="text"
              danger
              icon={<LogoutOutlined />}
              onClick={() => {
                localStorage.removeItem("user");
                nav("/login");
              }}
              className="header-btn"
            >
              <span className="btn-text">Logout</span>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="header-actions mobile-nav">
            <Badge count={cartCount} showZero>
              <Button 
                type="text" 
                icon={<ShoppingCartOutlined />}
                onClick={() => nav("/cart")}
                className="header-btn-mobile"
                size="large"
              />
            </Badge>
            <Button 
              type="text" 
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className="header-btn-mobile"
              size="large"
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        className="mobile-menu-drawer"
      >
        <div className="mobile-menu-items">
          <Button 
            type="text" 
            icon={<UserOutlined />}
            className="mobile-menu-btn"
            onClick={()=> {
              nav("/acconts");
              setMobileMenuOpen(false);
            }}
            block
          >
            Account
          </Button>
          <Button 
            type="text" 
            icon={<UnorderedListOutlined />}
            onClick={() => {
              nav("/orders");
              setMobileMenuOpen(false);
            }}
            className="mobile-menu-btn"
            block
          >
            Orders
          </Button>
          <Button 
            type="text" 
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              nav("/cart");
              setMobileMenuOpen(false);
            }}
            className="mobile-menu-btn"
            block
          >
            Cart ({cartCount})
          </Button>
          <Divider />
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            onClick={() => {
              localStorage.removeItem("user");
              nav("/login");
            }}
            className="mobile-menu-btn"
            block
          >
            Logout
          </Button>
        </div>
      </Drawer>

      {/* ---------- Category Navigation ---------- */}
      <div className="category-nav">
        <div className="category-nav-container">
          <Button
            type={!category ? "primary" : "text"}
            onClick={() => setCategory(undefined)}
            className="category-nav-btn"
          >
            All Products
          </Button>
          <Button
            type={category === 'Vegetables' ? "primary" : "text"}
            onClick={() => setCategory(category === 'Vegetables' ? undefined : 'Vegetables')}
            className="category-nav-btn"
          >
            🥬 Vegetables
          </Button>
          <Button
            type={category === 'Stationers items' ? "primary" : "text"}
            onClick={() => setCategory(category === 'Stationers items' ? undefined : 'Stationers items')}
            className="category-nav-btn"
          >
            ✏️ Stationery
          </Button>
          <Button
            type={category === 'Banana Leaf' ? "primary" : "text"}
            onClick={() => setCategory(category === 'Banana Leaf' ? undefined : 'Banana Leaf')}
            className="category-nav-btn"
          >
            🍃 Banana Leaf
          </Button>
        </div>
      </div>

      {/* ---------- Main Content ---------- */}
      <div className="main-content">
        {/* Breadcrumb / Filter Info */}
        <div className="filter-info">
          <Text className="results-text">
            {category ? `Showing results for "${category}"` : 'All Products'}
            <Text type="secondary" style={{ marginLeft: '8px' }}>({products.length} items)</Text>
          </Text>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* ---------- Product Grid ---------- */}
        {products.length === 0 ? (
          <div className="empty-products">
            <Text type="secondary" style={{ fontSize: '16px' }}>No products found</Text>
          </div>
        ) : (
          <Row gutter={[16, 16]} className="product-grid-ecommerce">
            {products.map((p) => (
              <Col key={p.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className="ecommerce-product-card"
                  cover={
                    <div className="product-image-container">
                      <img
                        alt={p.name}
                        src={`${config.baseURL}${p.image_url}`}
                        className="ecommerce-product-image"
                      />
                      {p.stock <= 5 && p.stock > 0 && (
                        <Tag color="orange" className="stock-badge">Only {p.stock} left</Tag>
                      )}
                      {p.stock === 0 && (
                        <Tag color="red" className="stock-badge">Out of Stock</Tag>
                      )}
                    </div>
                  }
                  bodyStyle={{ padding: '12px' }}
                >
                  <div className="product-info">
                    <Title level={5} className="product-name" ellipsis={{ rows: 2 }}>
                      {p.name}
                    </Title>
                    
                    <div className="product-rating">
                      <Tag color="green" icon={<StarFilled />} className="rating-tag">
                        4.5
                      </Tag>
                      {/* <Text type="secondary" className="rating-count">
                        ({Math.floor(Math.random() * 500 + 100)})
                      </Text> */}
                    </div>

                    <div className="product-pricing">
                      <Text className="product-price">₹{p.price}</Text>
                      <Text type="secondary" className="product-uom">/{p.uom || 'unit'}</Text>
                    </div>

                    <Text type="secondary" className="product-category">
                      {p.category || 'General'}
                    </Text>

                    <Button
                      type="primary"
                      block
                      size="large"
                      className="add-to-cart-btn"
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      icon={<ShoppingCartOutlined />}
                    >
                      {p.stock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
                    </Button>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* ---------- Footer ---------- */}
      <footer className="ecommerce-footer">
        <Text type="secondary">© 2024 RR Fresh Delivery - Fresh Vegetables & More</Text>
      </footer>
    </div>
  );
}
