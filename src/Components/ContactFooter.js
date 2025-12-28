import React from 'react';
import { Card, Space, Button, Typography, Divider } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function ContactFooter() {
  const contacts = [
    { name: 'MR. Thanga Kumar', phone: '9790047124' },
    { name: 'Sahadevan', phone: '7449053866' }
  ];

  const handleCall = (phoneNumber) => {
    window.location.href = `tel:${phoneNumber}`;
  };

  return (
    <div style={{ marginTop: '40px', marginBottom: '20px' }}>
      <Card 
        className="contact-footer-card"
        style={{
          backgroundColor: '#f0f2f5',
          borderRadius: '8px',
          border: '1px solid #d9d9d9'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '12px' }}>
            Any Queries? Please Contact Us
          </Text>
          <Divider style={{ margin: '12px 0' }} />
          <Space size="large" wrap style={{ justifyContent: 'center', width: '100%' }}>
            {contacts.map((contact, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  shape="circle"
                  size="large"
                  icon={<PhoneOutlined style={{ fontSize: '18px' }} />}
                  onClick={() => handleCall(contact.phone)}
                  style={{ marginBottom: '8px', backgroundColor: '#4caf50', borderColor: '#4caf50' }}
                />
                <div>
                  <Text strong style={{ display: 'block', fontSize: '13px' }}>
                    {contact.name}
                  </Text>
                  <Text style={{ display: 'block', fontSize: '13px', color: '#4caf50' }}>
                    {contact.phone}
                  </Text>
                </div>
              </div>
            ))}
          </Space>
        </div>
      </Card>
    </div>
  );
}
