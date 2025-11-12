import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spin, Typography, message, List, Tag, Avatar, Button, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import config from "../server";
import "../theme.css";

const { Title, Text } = Typography;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user || user.role !== "customer") {
      nav("/login");
      return;
    }
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
        const response = await fetch(`${config.baseURL}/api/orders/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
        const sortedOrders = data.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // hapy
            setOrders(sortedOrders);
        } else {
        message.error("Failed to fetch orders.");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Something went wrong while fetching orders.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="center-loader"><Spin size="large" /></div>;
  }
  console.log(orders);
  
  return (
    <div className="orders-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => nav(-1)}
          style={{ marginRight: '16px' }}
        >
          Back to Home
        </Button>
        <Title level={2} style={{ margin: 0 }}>🛍️ My Orders</Title>
      </div>
      {orders.length === 0 ? (
        <Card><Text>You have no orders.</Text></Card>
      ) : (
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
          dataSource={orders}
          renderItem={order => {
            const statusColors = {
              pending: 'gold',
              assigned: 'blue',
              picked_up: 'cyan',
              on_the_way: 'purple',
              delivered: 'green',
              cancelled: 'red'
            };

            return (
              <List.Item>
                <Card 
                  className="order-card-new"
                  title={`Order #${order.order_id}`}
                  extra={<Tag color={statusColors[order.status] || 'default'}>{order.status.replace("_", " ").toUpperCase()}</Tag>}
                >
                  <div className="order-card-body">
                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                    <List
                      itemLayout="horizontal"
                      dataSource={order.items}
                      renderItem={item => (
                        <List.Item className="order-list-item">
                          <List.Item.Meta
                            avatar={<Avatar src={`${config.baseURL}${item.image_url}`} />}
                            title={item.name}
                            description={`Price: ₹${item.price} | Qty: ${item.quantity}`}
                          />
                          <div className="order-item-subtotal">₹{item.price * item.quantity}</div>
                        </List.Item>
                      )}
                    />
                    <div className="order-total-new">
                      <strong>Total:</strong>
                      <strong>₹{order.total_price}</strong>
                    </div>
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <Space>
                        <Button onClick={() => nav(`/orders/${order.order_id}`)}>
                          View Details
                        </Button>
                        <Button 
                          type="primary" 
                          onClick={() => nav(`/track/${order.order_id}`)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          Track Order
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Card>
              </List.Item>
            );
          }}
        />
      )}
    </div>
  );
}
