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
  ShoppingCartOutlined,
  UserOutlined
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState();
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
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (categoryFilter) params.append('category', categoryFilter);
      const qs = params.toString();
      const res = await fetch(`${config.baseURL}/api/products${qs ? `?${qs}` : ''}`);
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
            ? `${config.baseURL}${image_url}` // 🔹 Adjust this base URL to match your backend
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
    title: "Category",
    dataIndex: "category",
    key: "category",
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
    title: "UOM",
    dataIndex: "uom",
    key: "uom",
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
      description: product.description || '',
      category: product.category || 'Vegetables',
      uom: product.uom || 'kg',
    });
    
    // Set the file list for image preview if product has an image
    if (product.image_url) {
      setFileList([{
        uid: '-1',
        name: 'current-image',
        status: 'done',
        url: `${config.baseURL}${product.image_url}`,
      }]);
    } else {
      setFileList([]);
    }
    
    setImageFile(null); // Reset any previously selected new image
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
              icon={<UserOutlined />}
              onClick={() => nav('/admin/users')}
              style={{ marginRight: 8 }}
            >
              Manage Users
            </Button>
            <Button 
              type="primary" 
              icon={<ShoppingCartOutlined />}
              onClick={() => nav('/admin/orders')}
              style={{ marginRight: 8 }}
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
          <Col xs={24} sm={12} md={8} >
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
          <Col xs={24} sm={12} md={8} >
            <Card className="stat-card">
              <ShoppingOutlined className="stat-icon" style={{ color: '#52c41a' }} />
              <div className="stat-content">
                <Title level={3} className="stat-value">{stats.totalProducts}</Title>
                <Text type="secondary">Products</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} >
            <Card 
              className="stat-card"
              onClick={() => nav('/admin/users')}
              hoverable
            >
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
                form.setFieldsValue({ category: 'Vegetables', uom: 'kg' });
                setModalVisible(true);
              }}
            >
              Add Product
            </Button>
          </Space>
        }
        className="admin-card"
      >
        <div style={{ marginBottom: 12 }}>
          <Space>
            <Input.Search
              allowClear
              placeholder="Search name, description, category, uom"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={() => loadProducts()}
              style={{ width: 280 }}
            />
            <Select
              allowClear
              placeholder="Filter by category"
              value={categoryFilter}
              onChange={(v) => { setCategoryFilter(v); setTimeout(loadProducts, 0); }}
              style={{ width: 200 }}
            >
              <Option value="Vegetables">Vegetables</Option>
              <Option value="Stationers items">Stationers items</Option>
              <Option value="Banana Leaf">Banana Leaf</Option>
            </Select>
            <Button onClick={() => loadProducts()}>Refresh</Button>
          </Space>
        </div>
        <Table 
          dataSource={products} 
          columns={productColumns} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={modalVisible}
        width="80%"
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
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
              
              const selectedFile = (fileList && fileList[0] && fileList[0].originFileObj)
                ? fileList[0].originFileObj
                : imageFile;
              if (selectedFile) {
                formData.append('image', selectedFile, selectedFile.name || 'upload.jpg');
              }
              console.log(formData);
              console.log(imageFile)
              const url = editingProduct 
                ? `${config.baseURL}/api/products/${editingProduct.id}`
                : `${config.baseURL}/api/products`;
              
              const method = editingProduct ? 'PUT' : 'POST';
              
              const res = await fetch(url, {
                method,
                body: formData,
                // Don't set Content-Type header - let the browser set it with the correct boundary
              });

              if (!res.ok) {
                throw new Error('Failed to save product');
              }

              message.success(`Product ${editingProduct ? 'updated' : 'added'} successfully`);
              setModalVisible(false);
              form.resetFields();
              setFileList([]);
              setImageFile(null);
              loadProducts();
            } catch (err) {
              console.error('Error saving product:', err);
              message.error(err.message || 'Failed to save product');
            }
          }}
        >
          <Row gutter={[16, 16]} className="admin-modal-form">
            <Col xs={24} sm={12} md={8} >
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category" style={{marginBottom:'10px'}}>
                  <Option value="Vegetables">Vegetables</Option>
                  <Option value="Stationers items">Stationers items</Option>
                  <Option value="Banana Leaf">Banana Leaf</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} >
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input placeholder="Enter product name" style={{marginBottom:'10px'}}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} >
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <Input type="number" step="0.01" placeholder="Enter price" style={{marginBottom:'10px'}}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} >
              <Form.Item
                name="uom"
                label="Unit of Measure (UOM)"
                rules={[{ required: true, message: 'Please select UOM' }]}
              >
                <Select placeholder="Select UOM" style={{marginBottom:'10px'}}>
                  <Option value="kg">kg</Option>
                  <Option value="g">g</Option>
                  <Option value="pcs">pcs</Option>
                  <Option value="bundle">bundle</Option>
                  <Option value="dozen">dozen</Option>
                  <Option value="leaf">leaf</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} >
              <Form.Item
                name="stock"
                label="Stock"
                rules={[{ required: true, message: 'Please enter stock' }]}
              >
                <Input type="number" placeholder="Enter stock quantity" style={{marginBottom:'10px'}}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} >
              <Form.Item label="Product Image">
                <Upload
                  listType="picture-card"
                  style={{marginBottom:'10px'}}
                  accept="image/*"
                  maxCount={1}
                  fileList={fileList}
                  beforeUpload={(file) => {
                    // prevent auto upload, we handle it in form submit
                    return false;
                  }}
                  onChange={({ file, fileList: newFileList }) => {
                    const fl = newFileList.slice(-1).map((f) => {
                      if (f.originFileObj && !f.thumbUrl) {
                        try { f.thumbUrl = URL.createObjectURL(f.originFileObj); } catch (_) {}
                      }
                      return f;
                    });
                    setFileList(fl);
                    if (file && file.originFileObj) setImageFile(file.originFileObj);
                  }}
                  onPreview={(file) => {
                    const src = file.url || file.thumbUrl;
                    if (src) {
                      setPreviewImage(src);
                      setPreviewTitle(file.name || 'Image Preview');
                      setPreviewOpen(true);
                    }
                  }}
                  onRemove={() => {
                    setImageFile(null);
                    setFileList([]);
                  }}
                >
                  <Button style={{ width: '80%' }} icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
              >
                <Input.TextArea rows={4} placeholder="Enter product description" style={{marginBottom:'10px'}} />
              </Form.Item>
            </Col>
          
                <Button type="primary" htmlType="submit">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
            
        
          </Row>
        </Form>
      </Modal>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
}
