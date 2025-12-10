import React, { useEffect, useMemo, useState } from "react";
import { Card, Row, Col, Select, InputNumber, Button, Table, Typography, Space, message, Input, Divider } from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import config from "../server";
import "../theme.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Billing(){
  const nav = useNavigate();
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, []);

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(undefined);
  const [selectedProduct, setSelectedProduct] = useState(undefined);
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]); // {product_id, name, price, quantity}
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      nav("/login");
      return;
    }
    loadData();
  }, []);

  async function loadData(){
    try{
      const [usersRes, productsRes] = await Promise.all([
        fetch(`${config.baseURL}/api/users`),
        fetch(`${config.baseURL}/api/products`),
      ]);
      const u = await usersRes.json();
      const p = await productsRes.json();
      setCustomers(u || []);
      setProducts(Array.isArray(p) ? p : []);
    }catch(e){
      console.error(e);
      message.error("Failed to load data");
    }
  }

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => `${p.name} ${p.category} ${p.uom}`.toLowerCase().includes(q)
    );
  }, [products, query]);

  function addToCart(){
    if (!selectedProduct) { message.warning("Select a product"); return; }
    const prod = products.find(p => p.id === selectedProduct);
    if (!prod) return;
    const q = Math.max(1, Number(qty) || 1);
    setCart(prev => {
      const idx = prev.findIndex(i => i.product_id === prod.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Number(next[idx].quantity) + q };
        return next;
      }
      return [...prev, { product_id: prod.id, name: prod.name, price: Number(prod.price) || 0, quantity: q }];
    });
    setQty(1);
    setSelectedProduct(undefined);
  }

  function updateQty(id, q){
    setCart(prev => prev.map(it => it.product_id === id ? { ...it, quantity: Math.max(1, Number(q) || 1) } : it));
  }
  function removeItem(id){
    setCart(prev => prev.filter(it => it.product_id !== id));
  }

  const total = useMemo(() => cart.reduce((s,it) => s + Number(it.price)*Number(it.quantity), 0), [cart]);

  async function submitOrder(){
    if (!selectedCustomer) { message.warning("Select a customer"); return; }
    if (cart.length === 0) { message.warning("Add at least one item"); return; }
    setSubmitting(true);
    try{
      const body = {
        user_id: selectedCustomer,
        items: cart.map(it => ({ product_id: it.product_id, quantity: Number(it.quantity), price: Number(it.price) })),
        delivery_address: "Walk-in billing",
        latitude: null,
        longitude: null,
      };
      const res = await fetch(`${config.baseURL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");
      message.success(`Order created #${data.orderId}`);
      setCart([]);
      // Navigate to details for printing if needed
      nav(`/admin/orders/${data.orderId}`);
    }catch(e){
      console.error(e);
      message.error(e.message || "Order failed");
    }finally{
      setSubmitting(false);
    }
  }

  const cartColumns = [
    { title: "Item", dataIndex: "name", key: "name" },
    { title: "Price", dataIndex: "price", key: "price", render: (p) => `₹${Number(p||0).toFixed(2)}` },
    { title: "Qty", dataIndex: "quantity", key: "quantity", render: (q, rec) => (
        <InputNumber min={1} value={q} onChange={(v) => updateQty(rec.product_id, v)} />
      ) },
    { title: "Amount", key: "amt", render: (_, rec) => `₹${(Number(rec.price)*Number(rec.quantity)).toFixed(2)}` },
    { title: "", key: "act", render: (_, rec) => (
        <Button danger type="link" icon={<DeleteOutlined />} onClick={() => removeItem(rec.product_id)}>Remove</Button>
      ) }
  ];

  return (
    <div className="orders-container">
      <Space align="center" style={{ marginBottom: 16 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => nav(-1)}>Back</Button>
        <Title level={3} style={{ margin: 0 }}>Billing</Title>
      </Space>

      <Row gutter={[16,16]}>
        <Col xs={24} lg={10}>
          <Card title="Customer">
            <Select
              showSearch
              allowClear
              placeholder="Select customer"
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              style={{ width: "100%" }}
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={(customers||[]).map(c => ({ value: c.id, label: `${c.name} (${c.email || c.phone_number || '-'})` }))}
            />
          </Card>

          <Card title="Add item" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Input
                allowClear
                placeholder="Search products"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Space>
                <Select
                  showSearch
                  placeholder="Select product"
                  value={selectedProduct}
                  onChange={setSelectedProduct}
                  style={{ minWidth: 260 }}
                  optionFilterProp="children"
                  filterOption={(input, option) => (option?.children ?? '').toLowerCase().includes(input.toLowerCase())}
                >
                  {filteredProducts.map(p => (
                    <Option key={p.id} value={p.id}>{p.name} — ₹{Number(p.price||0).toFixed(2)} {p.uom ? `/ ${p.uom}` : ''}</Option>
                  ))}
                </Select>
                <InputNumber min={1} value={qty} onChange={setQty} />
                <Button type="primary" icon={<PlusOutlined />} onClick={addToCart}>Add</Button>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card title="Cart">
            <Table
              dataSource={cart}
              columns={cartColumns}
              rowKey={(r) => r.product_id}
              pagination={false}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>Total</Text>
              <Title level={4} style={{ margin: 0 }}>₹{Number(total).toFixed(2)}</Title>
            </div>
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Button type="primary" onClick={submitOrder} loading={submitting}>Create Bill</Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
