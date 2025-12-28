import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, List, Divider, Row, Col, Form, Input, Radio, message, Steps, Progress, Space, Tag } from 'antd';
import { ShoppingCartOutlined, CreditCardOutlined, HomeOutlined, CheckCircleOutlined, EnvironmentOutlined, SafetyOutlined, ClockCircleOutlined, GiftOutlined } from '@ant-design/icons';
import ContactFooter from '../Components/ContactFooter';
import config from '../server';
import '../theme.css';

const { Title, Text } = Typography;

export default function Checkout(){
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const nav = useNavigate();
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

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
      // Construct full address from form fields
      const fullAddress = `${values.houseNo}, ${values.street}, ${values.landmark ? values.landmark + ', ' : ''}${values.area}, ${values.city}, ${values.pincode}`;
      
      const orderData = {
        user_id: user.id,
        items,
        delivery_address: fullAddress,
        address_details: {
          houseNo: values.houseNo,
          street: values.street,
          landmark: values.landmark,
          area: values.area,
          city: values.city,
          pincode: values.pincode
        },
        payment_method: values.paymentMethod,
      };

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

  const total = cart.reduce((s,i)=> s + i.quantity * Number(i.price), 0);
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
            <Button type="primary" size="large" onClick={() => nav('/customer')} style={{ marginTop: '16px' }}>
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
      icon: <ShoppingCartOutlined  />,
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
      {/* Professional Header with Progress */}
      <Card className="checkout-header-card-pro">
        <div className="checkout-header-content">
          <div className="checkout-header-main">
            <div className="checkout-icon-wrapper">
              <ShoppingCartOutlined className="checkout-main-icon" />
            </div>
            <div className="checkout-header-text">
              <Title level={2} className="checkout-title-pro">Secure Checkout</Title>
              <Text type="secondary" className="checkout-subtitle-pro">
                Complete your order in 3 simple steps • Safe & Secure Payment
              </Text>
            </div>
          </div>
          <div className="checkout-progress-wrapper">
            <Progress 
              percent={((currentStep + 1) / steps.length) * 100} 
              strokeColor={{
                '0%': '#4caf50',
                '100%': '#2e7d32',
              }}
              showInfo={false}
              strokeWidth={8}
            />
            <div className="checkout-steps-minimal">
              <Steps 
                current={currentStep} 
                items={steps} 
                size="small"
                labelPlacement="vertical"
              />
            </div>
          </div>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Enhanced Order Summary */}
          <Card 
            className="checkout-card-pro"
            title={
              <Space>
                <ShoppingCartOutlined style={{ fontSize: '18px', color: '#4caf50' }} />
                <span>Order Summary ({cart.length} items)</span>
              </Space>
            }
          >
            <List
              dataSource={cart}
              renderItem={(item) => (
                <List.Item className="checkout-order-item">
                  <div className="checkout-item-image">
                    <img 
                      src={`${config.baseURL}${item.image_url}`} 
                      alt={item.name}
                    />
                  </div>
                  <div className="checkout-item-details">
                    <Text strong className="checkout-item-name">{item.name}</Text>
                    <Text type="secondary" className="checkout-item-quantity">
                      Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}
                    </Text>
                  </div>
                  <div className="checkout-item-price">
                    <Text strong style={{ fontSize: '16px', color: '#2e7d32' }}>
                      ₹{(Number(item.price) * item.quantity).toFixed(2)}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* Delivery Details Card */}
          <Card 
            className="checkout-card-pro"
            title={
              <Space>
                <EnvironmentOutlined style={{ fontSize: '18px', color: '#4caf50' }} />
                <span>Delivery Details</span>
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={placeOrder}
              initialValues={{
                paymentMethod: 'cod'
              }}
            >
              <Form.Item
                label={
                  <Space>
                    <HomeOutlined />
                    <span>House / Flat No.</span>
                  </Space>
                }
                name="houseNo"
                rules={[{ required: true, message: 'Please enter house/flat number!' }]}
              >
                <Input
                  placeholder="House/Flat No., Building Name"
                  className="checkout-input"
                />
              </Form.Item>

              <Form.Item
                label="Street / Road Name"
                name="street"
                rules={[{ required: true, message: 'Please enter street name!' }]}
              >
                <Input
                  placeholder="Street / Road Name"
                  className="checkout-input"
                />
              </Form.Item>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Landmark (Optional)"
                    name="landmark"
                  >
                    <Input
                      placeholder="e.g., Near Hospital, Market"
                      className="checkout-input"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Area / Locality"
                    name="area"
                    rules={[{ required: true, message: 'Please enter area/locality!' }]}
                  >
                    <Input
                      placeholder="Area / Locality"
                      className="checkout-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="City / Town"
                    name="city"
                    rules={[{ required: true, message: 'Please enter city!' }]}
                  >
                    <Input
                      placeholder="City / Town"
                      className="checkout-input"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Pincode"
                    name="pincode"
                    rules={[
                      { required: true, message: 'Please enter pincode!' },
                      { pattern: /^[0-9]{6}$/, message: 'Pincode must be 6 digits!' }
                    ]}
                  >
                    <Input
                      placeholder="Enter 6-digit pincode"
                      maxLength="6"
                      className="checkout-input"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Payment Method Card */}
              <Divider />
              <div style={{ marginTop: '24px' }}>
                <Title level={5} style={{ marginBottom: '16px' }}>
                  <Space>
                    <CreditCardOutlined style={{ color: '#4caf50' }} />
                    <span>Payment Method</span>
                  </Space>
                </Title>
                <Form.Item
                  name="paymentMethod"
                  rules={[{ required: true, message: 'Please select a payment method!' }]}
                >
                  <Radio.Group className="payment-radio-group">
                    <Radio value="cod" className="payment-radio-option">
                      <div className="payment-option-content">
                        <SafetyOutlined style={{ fontSize: '20px',  }} />
                        <div>
                          <div className="payment-option-title">Cash on Delivery</div>
                          <div className="payment-option-desc">Pay when you receive</div>
                        </div>
                      </div>
                    </Radio>
                    <Radio value="online" className="payment-radio-option">
                      <div className="payment-option-content">
                        <CreditCardOutlined style={{ fontSize: '20px',  }} />
                        <div>
                          <div className="payment-option-title">Online Payment</div>
                          <div className="payment-option-desc">UPI, Cards, Wallets</div>
                        </div>
                      </div>
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>

              <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                  className="checkout-place-order-btn"
                  icon={<CheckCircleOutlined />}
                >
                  Place Order • ₹{finalTotal.toFixed(2)}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Enhanced Order Total */}
          <Card className="checkout-summary-card-pro">
            <Title level={4} className="summary-title">
              <ShoppingCartOutlined /> Order Total
            </Title>
            
            <div className="summary-breakdown">
              <div className="summary-row-pro">
                <Text className="summary-label">Subtotal ({cart.length} items)</Text>
                <Text strong className="summary-value">₹{total.toFixed(2)}</Text>
              </div>
              <div className="summary-row-pro">
                <Text className="summary-label">Delivery Fee</Text>
                <Text strong className="summary-value" style={{ color: deliveryFee === 0 ? '#4caf50' : '#212121' }}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}
                </Text>
              </div>
              {total < 400 && (
                <div className="free-delivery-banner">
                  <GiftOutlined /> Add ₹{(400 - total).toFixed(2)} more for FREE delivery!
                </div>
              )}
            </div>
            
            <Divider className="summary-divider" />
            
            <div className="summary-total">
              <Text className="total-label">Amount Payable</Text>
              <Title level={3} className="total-amount">₹{finalTotal.toFixed(2)}</Title>
            </div>
            
            <div className="savings-badge">
              <SafetyOutlined /> 100% Secure Checkout
            </div>
          </Card>

          {/* Delivery Info Card */}
          <Card className="checkout-info-card-pro">
            <Title level={5} className="info-card-title">
              <ClockCircleOutlined /> Delivery Information
            </Title>
            <Space direction="vertical" size="small" className="info-list">
              <div className="info-item">
                <CheckCircleOutlined className="info-icon" />
                <Text>Estimated delivery: 30-45 minutes</Text>
              </div>
              <div className="info-item">
                <CheckCircleOutlined className="info-icon" />
                <Text>Free delivery on orders above ₹400</Text>
              </div>
              <div className="info-item">
                <CheckCircleOutlined className="info-icon" />
                <Text>Fresh vegetables guaranteed</Text>
              </div>
              <div className="info-item">
                <CheckCircleOutlined className="info-icon" />
                <Text>Cash on delivery available</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Contact Footer */}
      <div style={{ padding: '0 16px', marginTop: '24px' }}>
        <ContactFooter />
      </div>
    </div>
  );
}
