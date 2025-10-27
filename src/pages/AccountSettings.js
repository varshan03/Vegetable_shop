import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography, Divider } from 'antd';
import { LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import config from '../server';

const { Title, Text } = Typography;

export default function AccountSettings() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('New passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`${config.baseURL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        message.success('Password updated successfully!');
        form.resetFields();
      } else {
        message.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      message.error('An error occurred while updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-settings-container" style={{ maxWidth: 500, margin: '40px auto', padding: '0 16px' }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      
      <Card>
        <Title level={3} style={{ marginBottom: 24 }}>
          <LockOutlined /> Change Password
        </Title>
        
        <Form
          form={form}
          name="change-password"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[
              { required: true, message: 'Please input your current password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password placeholder="Enter current password" size="large" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please input your new password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" size="large" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              Update Password
            </Button>
          </Form.Item>
        </Form>
        
        <Divider />
        
        <Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
          <strong>Password Requirements:</strong>
          <ul style={{ margin: '8px 0 0 20px' }}>
            <li>Minimum 6 characters</li>
            <li>Should not be the same as your current password</li>
          </ul>
        </Text>
      </Card>
    </div>
  );
}
