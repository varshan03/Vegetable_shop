import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Card, Button, Space, Typography, Tag, Form, Input, Modal, Row, Col, message } from "antd";
import { 
  TeamOutlined, 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  PhoneOutlined,
  UserAddOutlined,
  PlusOutlined
} from "@ant-design/icons";
import config from "../server";
import "../App.css";
import "../theme.css";
import "./Users.css";

const { Title } = Typography;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch(`${config.baseURL}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const handleAddUser = async (values) => {
    try {
      // Format phone number to ensure consistency
      let phoneNumber = values.phone_number;
      if (phoneNumber && !phoneNumber.startsWith('+')) {
        phoneNumber = `+91${phoneNumber}`; // Add country code if not present
      }
      
      const payload = { 
        ...values, 
        role: 'delivery',
        phone_number: phoneNumber
      };
      
      const res = await fetch(`${config.baseURL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error('Failed to add user');
      }
      
      message.success('Delivery user added successfully');
      setUserModalVisible(false);
      form.resetFields();
      loadUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      message.error(err.message || 'Failed to add user');
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (phone) => phone || '-',
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'delivery' ? 'green' : 'blue'}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <Card className="admin-header">
        <div className="header-content">
          <Title level={3} style={{ margin: 5 }}>Users Management</Title>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setUserModalVisible(true)}
          >
            Add Delivery User
          </Button>
        </div>
      </Card>

      <Card className="admin-card">
        <Table 
          dataSource={users} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
            <span>Add New Delivery User</span>
          </div>
        }
        open={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
        bodyStyle={{ padding: '24px' }}
        className="user-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
          className="user-form"
        >
          <div className="form-header">
            <div className="form-step">1</div>
            <div>
              <h4 style={{ margin: 0 }}>User Information</h4>
              <p className="text-muted">Enter the delivery user's details</p>
            </div>
          </div>
          <Row gutter={[24, 16]} className="form-content">
            <Col xs={24} md={12}>
              <div className="form-section">
                <Form.Item
                  name="name"
                  label={
                    <span className="form-label">
                      <span className="required">*</span> Full Name
                    </span>
                  }
                  rules={[{ required: true, message: 'Please enter the full name' }]}
                >
                  <Input 
                    placeholder="Enter full name" 
                    prefix={<UserOutlined className="input-prefix" />}
                    className="form-input"
                  />
                </Form.Item>
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="form-section">
                <Form.Item
                  name="email"
                  label={
                    <span className="form-label">
                      <span className="required">*</span> Email Address
                    </span>
                  }
                  rules={[{
                    required: true,
                    message: 'Please enter a valid email address',
                    type: 'email',
                  }]}
                >
                  <Input 
                    placeholder="name@example.com" 
                    prefix={<MailOutlined className="input-prefix" />}
                    className="form-input"
                  />
                </Form.Item>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="form-section">
                <Form.Item
                  name="password"
                  label={
                    <span className="form-label">
                      <span className="required">*</span> Password
                    </span>
                  }
                  rules={[{
                    required: true,
                    message: 'Password must be at least 6 characters',
                    min: 6,
                  }]}
                >
                  <Input.Password 
                    placeholder="Create a strong password"
                    prefix={<LockOutlined className="input-prefix" />}
                    className="form-input"
                  />
                </Form.Item>
                <div className="password-hint">
                  Use at least 6 characters. Include numbers and special characters for better security.
                </div>
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="form-section">
                <Form.Item
                  name="phone_number"
                  label={
                    <span className="form-label">
                      <span className="required">*</span> Phone Number
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: 'Please enter a valid phone number',
                    },
                    {
                      pattern: /^[0-9]{10,15}$/,
                      message: 'Please enter 10-15 digit number',
                    },
                  ]}
                >
                  <Input 
                    addonBefore={<span style={{ width: '40px' }}>+91</span>}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    className="form-input phone-input"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </div>
            </Col>
            
            <Col span={24}>
              <div className="role-tag">
                <Tag icon={<UserOutlined />} color="processing">
                  Role: <strong>Delivery</strong>
                </Tag>
                <span className="role-description">
                  This user will have delivery personnel access
                </span>
              </div>
            </Col>
            <Col span={24}>
              <div className="form-actions">
                <Button 
                  onClick={() => {
                    setUserModalVisible(false);
                    form.resetFields();
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="submit-btn"
                  icon={<UserAddOutlined />}
                >
                  Create Delivery User
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
