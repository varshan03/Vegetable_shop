import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Steps, Typography, Spin, Button, Timeline, Row, Col, Tag, Avatar } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  CarOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import config from '../server';
import '../theme.css';

const { Title, Text, Paragraph } = Typography;

export default function DeliveryTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) {
      nav('/login');
      return;
    }
    fetchOrderDetails();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrderDetails, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  async function fetchOrderDetails() {
    try {
      const response = await fetch(`${config.baseURL}/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        console.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="delivery-tracking-container">
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: '16px' }}>Loading order details...</Title>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="delivery-tracking-container">
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={3}>Order not found</Title>
            <Button type="primary" onClick={() => nav('/orders')}>
              Back to Orders
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStepStatus = (stepStatus, currentStatus) => {
    const statusOrder = ['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);
    
    if (stepIndex < currentIndex) return 'finish';
    if (stepIndex === currentIndex) return 'process';
    return 'wait';
  };

  const getCurrentStep = (status) => {
    const statusOrder = ['pending', 'assigned', 'picked_up', 'on_the_way', 'delivered'];
    return statusOrder.indexOf(status);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      assigned: 'blue',
      picked_up: 'cyan',
      on_the_way: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getEstimatedTime = (status) => {
    const times = {
      pending: '5-10 minutes',
      assigned: '10-15 minutes',
      picked_up: '20-30 minutes',
      on_the_way: '10-15 minutes',
      delivered: 'Completed'
    };
    return times[status] || 'Unknown';
  };

  const trackingSteps = [
    {
      title: 'Order Placed',
      description: 'Your order has been received',
      icon: <ShoppingCartOutlined />,
      status: 'pending'
    },
    {
      title: 'Order Assigned',
      description: 'Delivery partner assigned',
      icon: <UserOutlined />,
      status: 'assigned'
    },
    {
      title: 'Order Picked Up',
      description: 'Items collected from store',
      icon: <CarOutlined />,
      status: 'picked_up'
    },
    {
      title: 'On the Way',
      description: 'Delivery partner is on the way',
      icon: <EnvironmentOutlined />,
      status: 'on_the_way'
    },
    {
      title: 'Delivered',
      description: 'Order delivered successfully',
      icon: <CheckCircleOutlined />,
      status: 'delivered'
    }
  ];

  return (
    <div className="delivery-tracking-container">
      {/* Header Card */}
      <Card className="tracking-header-card">
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              🚚 Track Order #{order.order_id}
            </Title>
            <Text type="secondary">
              Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </Text>
          </Col>
          <Col>
            <Tag color={getStatusColor(order.status)} style={{ fontSize: '14px', padding: '4px 12px' }}>
              {order.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Tracking Steps */}
        <Col xs={24} lg={16}>
          <Card title="Delivery Status" className="tracking-steps-card">
            <Steps
              current={getCurrentStep(order.status)}
              direction="vertical"
              items={trackingSteps.map(step => ({
                title: step.title,
                description: step.description,
                icon: step.icon,
                status: getStepStatus(step.status, order.status)
              }))}
            />
            
            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <Row align="middle">
                <Col>
                  <ClockCircleOutlined style={{ color: '#4caf50', marginRight: '8px' }} />
                  <Text strong>Estimated Time: </Text>
                  <Text>{getEstimatedTime(order.status)}</Text>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Order Items */}
          <Card title="Order Items" className="order-items-card">
            {order.items.map((item, index) => (
              <div key={index} className="tracking-order-item">
                <Avatar src={`${config.baseURL}${item.image_url}`} size={50} />
                <div className="item-details">
                  <Text strong>{item.name}</Text>
                  <br />
                  <Text type="secondary">₹{item.price} × {item.quantity}</Text>
                </div>
                <div className="item-total">
                  <Text strong>₹{(item.price * item.quantity).toFixed(2)}</Text>
                </div>
              </div>
            ))}
            <div className="order-total-tracking">
              <Text strong style={{ fontSize: '16px' }}>
                Total: ₹{order.total_price}
              </Text>
            </div>
          </Card>
        </Col>

        {/* Delivery Info Sidebar */}
        <Col xs={24} lg={8}>
          {order.delivery_partner && (
            <Card title="Delivery Partner" className="delivery-partner-card">
              <div style={{ textAlign: 'center' }}>
                <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#4caf50' }} />
                <Title level={4} style={{ marginTop: '12px' }}>
                  {order.delivery_partner.name}
                </Title>
                <Text type="secondary">Delivery Partner</Text>
                <br />
                <Button 
                  type="primary" 
                  icon={<PhoneOutlined />} 
                  style={{ marginTop: '12px' }}
                  block
                >
                  Call Partner
                </Button>
              </div>
            </Card>
          )}

          <Card title="Delivery Address" className="delivery-address-card">
            <Paragraph>
              <EnvironmentOutlined style={{ color: '#4caf50', marginRight: '8px' }} />
              {order.delivery_address || 'Address not provided'}
            </Paragraph>
          </Card>

          <Card title="Payment Method" className="payment-method-card">
            <Text>
              {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
            </Text>
          </Card>

          <Card className="help-card">
            <Title level={5}>Need Help?</Title>
            <Paragraph type="secondary">
              Having issues with your order? Contact our support team.
            </Paragraph>
            <Button type="default" block>
              Contact Support
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
