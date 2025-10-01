// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Card, Button, Input, Typography, Select, Form, Space, message } from "antd";
import config from "../server";
import "../App.css";

const { Title } = Typography;
const { Option } = Select;

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]); // delivery persons
  const [form] = Form.useForm();
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      nav("/login");
      return;
    }
    loadProducts();
    loadOrders();
    loadUsers();
  }, []);

  async function loadProducts() {
    const res = await fetch(`${config.baseURL}/api/products`);
    const data = await res.json();
    setProducts(data);
  }

  async function loadOrders() {
    const res = await fetch(`${config.baseURL}/api/orders`);
    const data = await res.json();
    setOrders(data);
  }

  async function loadUsers() {
    const res = await fetch(`${config.baseURL}/api/users?role=delivery`);
    const data = await res.json();
    setUsers(data);
  }

  async function addProduct(values) {
    const res = await fetch(`${config.baseURL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      message.success("Product added!");
      form.resetFields();
      loadProducts();
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete product?")) return;
    await fetch(`${config.baseURL}/api/products/${id}`, { method: "DELETE" });
    message.success("Product deleted!");
    loadProducts();
  }

  async function assignOrder(orderId, deliveryId) {
    await fetch(`${config.baseURL}/api/orders/${orderId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_person_id: deliveryId }),
    });
    message.success("Order assigned!");
    loadOrders();
  }

  return (
    <div className="admin-container">
      <Title level={2} className="dashboard-title">Admin Dashboard</Title>

      {/* ------------------ Product Management ------------------ */}
      <Card title="Manage Products" className="admin-card">
        <Form
          layout="inline"
          form={form}
          onFinish={addProduct}
          className="product-form"
        >
          <Form.Item name="name" rules={[{ required: true, message: "Enter name" }]}>
            <Input placeholder="Name" />
          </Form.Item>
          <Form.Item name="price" rules={[{ required: true, message: "Enter price" }]}>
            <Input placeholder="Price" />
          </Form.Item>
          <Form.Item name="stock" rules={[{ required: true, message: "Enter stock" }]}>
            <Input placeholder="Stock" />
          </Form.Item>
          <Form.Item name="image" rules={[{ required: true, message: "Enter image URL" }]}>
            <Input placeholder="Image URL" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Add</Button>
          </Form.Item>
        </Form>

        <div className="grid">
          {products.map((p) => (
            <Card
              key={p.id}
              className="product-card"
              cover={<img alt={p.name} src={p.image_url} />}
              actions={[
                <Button danger onClick={() => deleteProduct(p.id)}>Delete</Button>
              ]}
            >
              <Card.Meta title={p.name} description={`₹${p.price} | Stock: ${p.stock}`} />
            </Card>
          ))}
        </div>
      </Card>

      {/* ------------------ Orders ------------------ */}
      <Card title="Orders" className="admin-card">
        <Table
          dataSource={orders}
          rowKey="id"
          bordered
          pagination={{ pageSize: 5 }}
        >
          <Table.Column title="ID" dataIndex="id" key="id" />
          <Table.Column title="Customer" dataIndex="customer_id" key="customer" />
          <Table.Column title="Total" dataIndex="total_price" key="total" render={(val) => `₹${val}`} />
          <Table.Column title="Status" dataIndex="status" key="status" />
          <Table.Column
            title="Assign Delivery"
            key="assign"
            render={(text, record) => (
              <Select
                placeholder="Select Delivery"
                style={{ width: 150 }}
                onChange={(val) => assignOrder(record.id, val)}
              >
                {users.map((u) => (
                  <Option key={u.id} value={u.id}>{u.name}</Option>
                ))}
              </Select>
            )}
          />
        </Table>
      </Card>
    </div>
  );
}
