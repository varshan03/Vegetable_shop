import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, List, Divider, Row, Col, Form, Input, Radio, message, Steps } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import config from '../server';
import '../theme.css';

const { Title, Text } = Typography;

export default function Checkout(){
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [location, setLocation] = useState({ latitude: null, longitude: null, error: null });
  const [form] = Form.useForm();
  const nav = useNavigate();
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
          });
        },
        (error) => {
          setLocation({
            latitude: null,
            longitude: null,
            error: 'Unable to retrieve your location. Please enable location services for better delivery experience.'
          });
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser.'
      });
    }
  }, []);

  async function placeOrder(values){
    if (!user) { 
      message.error('Login required'); 
      nav('/login'); 
      return; 
    }
    
    setLoading(true);
    const items = cart.map(it => ({ 
      product_id: it.product_id, 
      quantity: it.quantity, 
      price: it.price 
    }));
    
    try {
      const orderData = {
        user_id: user.id,
        items,
        delivery_address: values.address,
        payment_method: values.paymentMethod,
      };

      // Add location if available
      if (location.latitude && location.longitude) {
        orderData.latitude = location.latitude;
        orderData.longitude = location.longitude;
      }

      const res = await fetch(`${config.baseURL}/api/orders`, {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(orderData)
      });
      
      if (!res.ok) {
        const t = await res.json();
        throw new Error(t.error || 'Order failed');
      }
      
      const r = await res.json();
      localStorage.removeItem('cart');
      message.success(`Order placed successfully! Order ID: ${r.orderId}`);
      nav('/orders');
    } catch(err){ 
      message.error(err.message); 
    } finally {
      setLoading(false);
    }
  }

  const total = cart.reduce((s,i)=> s + i.quantity * i.price, 0);
  const deliveryFee = total > 400 ? 0 : 40;
  const finalTotal = total + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <Card className="empty-checkout-card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <ShoppingCartOutlined style={{ fontSize: '64px', color: '#bdbdbd', marginBottom: '16px' }} />
            <Title level={3}>Your cart is empty</Title>
            <Text type="secondary">Add some vegetables to your cart to proceed with checkout</Text>
            <br />
            <Button type="primary" size="large" onClick={() => nav('/')} style={{ marginTop: '16px' }}>
              Continue Shopping
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const steps = [
    {
      title: 'Order Review',
      icon: <ShoppingCartOutlined />,
    },
    {
      title: 'Delivery Details',
      icon: <HomeOutlined />,
    },
    {
      title: 'Payment',
      icon: <CreditCardOutlined />,
    },
    {
      title: 'Confirmation',
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <div className="checkout-container">
      <Card className="checkout-header-card">
        <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
          🛒 Checkout
        </Title>
        <Steps current={currentStep} items={steps} />
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Order Summary" className="checkout-card">
            <List
              dataSource={cart}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <img 
                        src={`${config.baseURL}${item.image_url}`} 
                        alt={item.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                    }
                    title={item.name}
                    description={`Quantity: ${item.quantity}`}
                  />
                  <Text strong>₹{(item.price * item.quantity).toFixed(2)}</Text>
                </List.Item>
              )}
            />
          </Card>

          <Card title="Delivery & Payment Details" className="checkout-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={placeOrder}
              initialValues={{
                paymentMethod: 'cod'
              }}
            >
              {location.error && (
                <div style={{ color: '#ff4d4f', marginBottom: '16px' }}>
                  {location.error}
                </div>
              )}
              {location.latitude && location.longitude && (
                <div style={{ color: '#52c41a', marginBottom: '16px' }}>
                  Location detected: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
              )}
              <Form.Item
                label="Delivery Address"
                name="address"
                rules={[{ required: true, message: 'Please enter your delivery address!' }]}
                extra="Please ensure your address is accurate for smooth delivery"
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter your complete delivery address"
                />
              </Form.Item>

              <Form.Item
                label="Payment Method"
                name="paymentMethod"
                rules={[{ required: true, message: 'Please select a payment method!' }]}
              >
                <Radio.Group>
                  <Radio value="cod">Cash on Delivery</Radio>
                  <Radio value="online">Online Payment</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  style={{ height: '48px', fontSize: '16px', fontWeight: '600' }}
                >
                  Place Order - ₹{finalTotal.toFixed(2)}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Order Total" className="checkout-summary-card">
            <div className="summary-row">
              <Text>Subtotal ({cart.length} items)</Text>
              <Text strong>₹{total.toFixed(2)}</Text>
            </div>
            <div className="summary-row">
              <Text>Delivery Fee</Text>
              <Text strong style={{ color: deliveryFee === 0 ? '#4caf50' : undefined }}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
              </Text>
            </div>
            {total < 400 && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Add ₹{(400 - total).toFixed(2)} more for free delivery
              </Text>
            )}
            <Divider />
            <div className="summary-row total-row">
              <Title level={4} style={{ margin: 0 }}>Total</Title>
              <Title level={4} style={{ margin: 0, color: '#4caf50' }}>₹{finalTotal.toFixed(2)}</Title>
            </div>
          </Card>

          <Card className="checkout-info-card">
            <Title level={5}>🚚 Delivery Information</Title>
            <Text type="secondary">
              • Estimated delivery: 30-45 minutes<br/>
              • Free delivery on orders above ₹400<br/>
              • Fresh vegetables guaranteed<br/>
              • Cash on delivery available
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
