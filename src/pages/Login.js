import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import config from "../server";
import "../App.css"; // make sure CSS is imported

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  async function handleLogin(values) {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${config.baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const t = await res.json();
        throw new Error(t.error || "Login failed");
      }

      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));

      // role based routing
      if (user.role === "admin") nav("/admin");
      else if (user.role === "delivery") nav("/delivery");
      else nav("/");
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
            🥦 Vegetable Shop — Login
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
            name="login"
            layout="vertical"
            onFinish={handleLogin}
            initialValues={{ email: "", password: "" }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input
                prefix={<UserOutlined />}
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

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="login-btn"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        
        </Card>
      </div>
    </div>
  );
}
