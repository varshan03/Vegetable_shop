import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import config from "../server";
import "../App.css";
import "../theme.css";

const { Title } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function handleLogin(values) {
    setLoading(true);
    const hide = message.loading("Logging in...", 0);

    try {
      const res = await fetch(`${config.baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("user", JSON.stringify(data));
      hide();
      message.success(`Welcome back, ${data.name || "user"}!`, 2);

      // role-based navigation
      if (data.role === "admin") nav("/admin");
      else if (data.role === "delivery") nav("/delivery");
      else nav("/");
    } catch (err) {
      hide();
      message.error(err.message || "Something went wrong", 3);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 This handles form validation errors (like required fields)
  function handleValidationError(errorInfo) {
    const firstError = errorInfo.errorFields?.[0]?.errors?.[0];
    if (firstError) {
      message.warning(firstError, 2); // show warning popup
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        <Card className="login-card" bordered={false}>
          <Title level={3} className="login-title">
            🥦 Vegetable Shop — Login
          </Title>

          <Form
            name="login"
            layout="vertical"
            onFinish={handleLogin}
            onFinishFailed={handleValidationError} // ⬅️ shows popup for validation error
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

          <div style={{ textAlign: "center", marginTop: 16 }}>
            Don’t have an account? <Link to="/signup">Sign up</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
