// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Button,
  Input,
  Typography,
  Select,
  Form,
  Upload,
  message,
  Modal,
  Space,
} from "antd";
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LogoutOutlined } from "@ant-design/icons";
import config from "../server";
import "../App.css";
import "../theme.css";

const { Title } = Typography;
const { Option } = Select;

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [ordersVisible, setOrdersVisible] = useState(false);
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
    const res = await fetch(`${config.baseURL}/api/delivery/person`);
    const data = await res.json();
    setUsers(data);
  }

  async function handleSave(values) {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("price", values.price);
      formData.append("stock", values.stock);
      if (imageFile) formData.append("image", imageFile);

      let res;
      if (editingProduct) {
        // Update product
        res = await fetch(`${config.baseURL}/api/products/${editingProduct.id}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        // Add product
        res = await fetch(`${config.baseURL}/api/products`, {
          method: "POST",
          body: formData,
        });
      }

      if (res.ok) {
        message.success(editingProduct ? "Product updated!" : "Product added!");
        setModalVisible(false);
        form.resetFields();
        setImageFile(null);
        setFileList([]);
        setEditingProduct(null);
        loadProducts();
      } else {
        message.error("Failed to save product");
      }
    } catch (err) {
      console.error(err);
      message.error("Something went wrong");
    }
  }

  async function deleteProduct(id) {
    Modal.confirm({
      title: "Delete product?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        await fetch(`${config.baseURL}/api/products/${id}`, { method: "DELETE" });
        message.success("Product deleted!");
        loadProducts();
      },
    });
  }

  async function assignOrder(orderId, deliveryId) {
    await fetch(`${config.baseURL}/api/orders/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delivery_person_id: deliveryId, order_id: orderId }),
    });
    message.success("Order assigned!");
    loadOrders();
  }

  const productColumns = [
    { title: "ID", dataIndex: "id" },
    { title: "Name", dataIndex: "name" },
    { title: "Price", dataIndex: "price", render: (val) => `₹${val}` },
    { title: "Stock", dataIndex: "stock" },
    {
      title: "Image",
      dataIndex: "image_url",
      render: (url) => <img src={`${config.baseURL}${url}`}  alt="product" style={{ width: 50, height: 50, objectFit: "cover" }} />,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(record);
              setModalVisible(true);
              form.setFieldsValue(record);
              setFileList([]);
            }}
          >
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => deleteProduct(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      {/* Header */}
      <Card className="admin-header-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#2e7d32' }}>
              🥦 Admin Dashboard
            </Title>
            <p style={{ margin: 0, color: '#757575' }}>Manage your vegetable shop</p>
          </div>
          <Space>
            <Button type="default" onClick={() => setOrdersVisible(!ordersVisible)}>
              {ordersVisible ? "Hide Orders" : "Show Orders"}
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Add Product
            </Button>
            <Button 
              danger 
              icon={<LogoutOutlined />} 
              onClick={() => {
                localStorage.removeItem('user');
                nav('/login');
              }}
            >
              Logout
            </Button>
          </Space>
        </div>
      </Card>

      <Card title="Products" className="admin-card">
        <Table dataSource={products} columns={productColumns} rowKey="id" bordered pagination={{ pageSize: 5 }} />
      </Card>

      {ordersVisible && (
        <Card title="Orders" className="admin-card">
          <Table dataSource={orders} rowKey="id" bordered pagination={{ pageSize: 5 }}>
            <Table.Column title="ID" dataIndex="id" />
            <Table.Column title="Customer" dataIndex="customer_id" />
            <Table.Column title="Total" dataIndex="total_price" render={(val) => `₹${val}`} />
            <Table.Column title="Status" dataIndex="status" />
            <Table.Column
              title="Assign Delivery"
              render={(text, record) => (
                <Select
                  placeholder="Select Delivery"
                  style={{ width: 150 }}
                  onChange={(val) => assignOrder(record.id, val)}
                >
                  {users.map((u) => (
                    <Option key={u.id} value={u.id}>
                      {u.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Table>
        </Card>
      )}

      {/* Modal for Add/Edit Product */}
      <Modal
        title={editingProduct ? "Edit Product" : "Add Product"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingProduct(null);
          setFileList([]);
          setImageFile(null);
        }}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleSave}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Enter name" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: "Enter price" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true, message: "Enter stock" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Image">
            <Upload
              beforeUpload={(file) => {
                setImageFile(file);
                setFileList([file]);
                return false;
              }}
              onRemove={() => {
                setImageFile(null);
                setFileList([]);
              }}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
