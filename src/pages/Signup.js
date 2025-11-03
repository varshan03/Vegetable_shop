import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import config from "../server";
import "../App.css";
import "../theme.css";

const { Title } = Typography;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function handleSignup(values) {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${config.baseURL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const t = await res.json();
        throw new Error(t.error || "Signup failed");
      }

      nav("/login");
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        <Card className="login-card" bordered={false}>
          <Title level={3} className="login-title">
            🥦 Vegetable Shop — Signup
          </Title>
          {err && (
            <Alert
              message={err}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 16 }}
            />
          )}
          <Form
            name="signup"
            layout="vertical"
            onFinish={handleSignup}
            initialValues={{ name: "", email: "", password: "", phone_number: "" }}
          >
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name!" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter name"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password!" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Phone Number"
              name="phone_number"
              rules={[
                { required: true, message: 'Please enter your phone number!' },
                { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
              ]}
            >
              <Input
                addonBefore="+91"
                prefix={<PhoneOutlined />}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                size="large"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="login-btn"
              >
                Signup
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
}
