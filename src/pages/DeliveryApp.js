// frontend/src/pages/DeliveryApp.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Typography, Spin, message, Row, Col } from "antd";
import { LogoutOutlined, ArrowRightOutlined, EnvironmentOutlined } from "@ant-design/icons";
import config from "../server";
import "../App.css";

const { Title } = Typography;

export default function DeliveryApp() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "delivery") {
      nav("/login");
      return;
    }
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${config.baseURL}/api/delivery/tasks/${user.id}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      message.error("Error fetching tasks");
    }
    setLoading(false);
  }

  async function updateTask(taskId, newStatus) {
    try {
      await fetch(`${config.baseURL}/api/delivery/task/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      message.success(`Task updated to ${newStatus}`);
      fetchTasks();
    } catch (err) {
      message.error("Update failed");
    }
  }

  function nextStatus(current) {
    if (current === "assigned") return "picked_up";
    if (current === "picked_up") return "on_the_way";
    if (current === "on_the_way") return "delivered";
    return null;
  }

  function handleNavigate(customerLat, customerLng) {
    if (!customerLat || !customerLng) {
      message.error("Customer location not available.");
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${customerLat},${customerLng}`;
          window.open(url, "_blank");
        },
        (error) => {
          message.error("Could not get your current location. Please enable location services.",error);
          console.log(error);
          
          console.error("Geolocation error:", error);
        }
      );
    } else {
      message.error("Geolocation is not supported by this browser.");
    }
  }

  return (
    <div className="delivery-container">
      {/* Header */}
      <header className="delivery-header">
        <Title level={3} style={{ color: "#fff", margin: 0 }}>
          🚚 Delivery Dashboard
        </Title>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={() => {
            localStorage.removeItem("user");
            nav("/login");
          }}
        >
          Logout
        </Button>
      </header>

      {/* Loading State */}
      {loading ? (
        <div className="center-loader">
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]} className="task-grid">
          {tasks.map((t) => (
            <Col xs={24} sm={12} md={8} lg={6} key={t.id}>
              <Card
                title={`Order #${t.order_id}`}
                className="delivery-card"
                bordered={false}
              >
                <p><strong>Customer:</strong> {t.customer_name || "N/A"}</p>
                <p><strong>Address:</strong> {t.address || "N/A"}</p>
                <p><strong>Total:</strong> ₹{t.total_price}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-badge ${t.status}`}>
                    {t.status}
                  </span>
                </p>
                {nextStatus(t.status) && (
                  <Button
                    type="primary"
                    block
                    icon={<ArrowRightOutlined />}
                    onClick={() => updateTask(t.id, nextStatus(t.status))}
                  >
                    Mark as {nextStatus(t.status)}
                  </Button>
                )}
                <Button
                  type="default"
                  block
                  icon={<EnvironmentOutlined />}
                  style={{ marginTop: '10px' }}
                  onClick={() => handleNavigate(t.latitude, t.longitude)}
                  disabled={!t.latitude || !t.longitude}
                >
                  Navigate
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
