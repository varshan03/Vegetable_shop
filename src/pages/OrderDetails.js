import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Avatar, Tag, Typography, Spin, message, Button, Divider, Space } from "antd";
import { ArrowLeftOutlined, AimOutlined } from "@ant-design/icons";
import config from "../server";
import "../theme.css";

const { Title, Text } = Typography;

export default function OrderDetails() {
  const { orderId } = useParams();
  const nav = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`${config.baseURL}/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order details");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
        message.error(err.message || "Something went wrong while fetching the order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div className="center-loader"><Spin size="large" /></div>;
  }

  if (!order) {
    return (
      <div className="orders-container">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => nav('/orders')} style={{ marginBottom: 16 }}>
          Back to Orders
        </Button>
        <Card><Text>Order not found.</Text></Card>
      </div>
    );
  }

  const statusColors = {
    pending: 'gold',
    assigned: 'blue',
    picked_up: 'cyan',
    on_the_way: 'purple',
    delivered: 'green',
    cancelled: 'red'
  };

  const createdOn = order.created_at ? new Date(order.created_at).toLocaleString() : '-';

  return (
    <div className="orders-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => nav('/admin/orders')} style={{ marginRight: 16 }}>
          Back to Orders
        </Button>
        <Title level={2} style={{ margin: 0 }}>Order #{order.order_id}</Title>
      </div>

      <Card className="order-card-new" title={<Space size={8}>
        <span>Order Details</span>
        <Tag color={statusColors[order.status] || 'default'}>{String(order.status).replace('_', ' ').toUpperCase()}</Tag>
      </Space>}>
        <Space direction="vertical" size={4}>
          <Text><strong>Date:</strong> {createdOn}</Text>
          <Text><strong>Total:</strong> ₹{order.total_price}</Text>
          <Text><strong>Payment:</strong> {order.payment_method?.toUpperCase() || 'COD'}</Text>
          {order.delivery_address && (
            <Text>
              <strong>Delivery Address:</strong> {order.delivery_address}
            </Text>
          )}
          {(order.latitude && order.longitude) && (
            <Button
              type="default"
              icon={<AimOutlined />}
              onClick={() => nav(`/track/${order.order_id}`)}
              disabled={order.status === 'delivered' || order.status === 'cancelled'}
              style={{ width: 'fit-content' }}
            >
              Track Delivery
            </Button>
          )}
        </Space>

        {order.delivery_partner && (
          <>
            <Divider />
            <Space direction="vertical" size={2}>
              <Text><strong>Delivery Partner:</strong> {order.delivery_partner.name}</Text>
              {order.delivery_partner.phone && <Text><strong>Phone:</strong> {order.delivery_partner.phone}</Text>}
              {order.delivery_partner.task_status && (
                <Text><strong>Task Status:</strong> {String(order.delivery_partner.task_status).replace('_',' ')}</Text>
              )}
            </Space>
          </>
        )}

        <Divider />
        <Title level={4} style={{ marginTop: 0 }}>Items</Title>
        <List
          itemLayout="horizontal"
          dataSource={order.items || []}
          renderItem={(item) => (
            <List.Item className="order-list-item">
              <List.Item.Meta
                avatar={<Avatar src={`${config.baseURL}${item.image_url}`} />}
                title={item.name}
                description={`Price: ₹${item.price} | Qty: ${item.quantity}`}
              />
              <div className="order-item-subtotal">₹{Number(item.price) * Number(item.quantity)}</div>
            </List.Item>
          )}
        />
        <div className="order-total-new">
          <strong>Total</strong>
          <strong>₹{order.total_price}</strong>
        </div>
      </Card>
    </div>
  );
}
