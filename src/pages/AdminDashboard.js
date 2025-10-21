// frontend/src/pages/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Card,
  Button,
  Input,
  Image,
  Typography,
  Select,
  Form,
  Tag,
  Upload,
  message,
  Modal,
  Space,
  Row,
  Col
} from "antd";
import { 
  UploadOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LogoutOutlined, 
  ShoppingOutlined, 
  TeamOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons";
import config from "../server";
import "../App.css";
import "../theme.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, totalUsers: 0 });
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      nav("/login");
      return;
    }
    loadProducts();
    loadStats();
  }, []);

  async function loadProducts() {
    try {
      const res = await fetch(`${config.baseURL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      message.error('Failed to load products');
    }
  }

  async function loadStats() {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${config.baseURL}/api/products`),
        fetch(`${config.baseURL}/api/orders`),
        fetch(`${config.baseURL}/api/users`)
      ]);
      
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      console.log(productsData,ordersData,usersData);
      
      
      setStats({
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalUsers: usersData.length
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      message.error('Failed to load dashboard statistics');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    nav("/login");
  };

const productColumns = [
  {
    title: "Image",
    dataIndex: "image_url",
    key: "image_url",
    render: (image_url) => (
      <Image
        width={60}
        height={60}
        src={
          image_url
            ? `http://localhost:4000${image_url}` // 🔹 Adjust this base URL to match your backend
            : "https://via.placeholder.com/60"
        }
        alt="Product"
        style={{
          objectFit: "cover",
          borderRadius: "8px",
          boxShadow: "0 0 4px rgba(0,0,0,0.15)",
        }}
      />
    ),
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
    render: (price) => {
      if (price === undefined || price === null || price === "") {
        return "₹0.00";
      }
      const priceNum = Number(price);
      return `₹${!isNaN(priceNum) ? priceNum.toFixed(2) : "0.00"}`;
    },
  },
  {
    title: "Stock",
    dataIndex: "stock",
    key: "stock",
  },
  {
    title: "Actions",
    key: "actions",
    render: (_, record) => (
      <Space size="middle">
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditProduct(record)}
        >
          Edit
        </Button>
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteProduct(record.id)}
        >
          Delete
        </Button>
      </Space>
    ),
  },
];
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
    });
    setModalVisible(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await fetch(`${config.baseURL}/api/products/${productId}`, {
        method: 'DELETE',
      });
      message.success('Product deleted successfully');
      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      message.error('Failed to delete product');
    }
  };

  return (
    <div className="admin-container">
      <Card className="admin-header">
        <div className="header-content">
          <Title level={3} style={{ margin: 5 }}>Admin Dashboard</Title>
          <Space>
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              onClick={() => nav('/admin/orders')}
            >
              View Orders
            </Button>
            <Button 
              type="default" 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </div>
      </Card>

      <div className="dashboard-stats" style={{marginTop:'10px'}}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card 
              className="stat-card"
              onClick={() => nav('/admin/orders')}
              hoverable
            >
              <ShoppingOutlined className="stat-icon" style={{ color: '#1890ff' }} />
              <div className="stat-content">
                <Title level={3} className="stat-value">{stats.totalOrders}</Title>
                <Text type="secondary">Total Orders</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <ShoppingOutlined className="stat-icon" style={{ color: '#52c41a' }} />
              <div className="stat-content">
                <Title level={3} className="stat-value">{stats.totalProducts}</Title>
                <Text type="secondary">Products</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="stat-card">
              <TeamOutlined className="stat-icon" style={{ color: '#722ed1' }} />
              <div className="stat-content">
                <Title level={3} className="stat-value">{stats.totalUsers}</Title>
                <Text type="secondary">Users</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card 
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>Products</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingProduct(null);
                form.resetFields();
                setFileList([]);
                setImageFile(null);
                setModalVisible(true);
              }}
            >
              Add Product
            </Button>
          </Space>
        }
        className="admin-card"
      >
        <Table 
          dataSource={products} 
          columns={productColumns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

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
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const formData = new FormData();
              Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
              });
              
              if (imageFile) {
                formData.append('image', imageFile);
              }

              const url = editingProduct 
                ? `${config.baseURL}/api/products/${editingProduct.id}`
                : `${config.baseURL}/api/products`;
              
              const method = editingProduct ? 'PUT' : 'POST';
              
              const res = await fetch(url, {
                method,
                body: formData,
              });

              if (!res.ok) {
                throw new Error('Failed to save product');
              }

              message.success(`Product ${editingProduct ? 'updated' : 'added'} successfully`);
              setModalVisible(false);
              form.resetFields();
              loadProducts();
            } catch (err) {
              console.error('Error saving product:', err);
              message.error(err.message || 'Failed to save product');
            }
          }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name' }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please enter price' }]}
          >
            <Input type="number" step="0.01" placeholder="Enter price" />
          </Form.Item>
          
          <Form.Item
            name="stock"
            label="Stock"
            rules={[{ required: true, message: 'Please enter stock' }]}
          >
            <Input type="number" placeholder="Enter stock quantity" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} placeholder="Enter product description" />
          </Form.Item>
          
          <Form.Item label="Product Image">
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setImageFile(file);
                return false;
              }}
              onRemove={() => {
                setImageFile(null);
                setFileList([]);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
