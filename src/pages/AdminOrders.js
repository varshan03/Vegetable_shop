import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Typography, message, Tag, Select, Modal } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import config from '../server';

const { Title } = Typography;
const { Option } = Select;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [assignModal, setAssignModal] = useState({ visible: false, orderId: null });
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPersons();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${config.baseURL}/api/orders/new`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeliveryPersons() {
    try {
      const res = await fetch(`${config.baseURL}/api/delivery/person`);
      const data = await res.json();
      setDeliveryPersons(data);
    } catch (err) {
      console.error('Error fetching delivery persons:', err);
      message.error('Failed to load delivery persons');
    }
  }

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: 'orange', text: 'Pending' },
          processing: { color: 'blue', text: 'Processing' },
          shipped: { color: 'geekblue', text: 'Shipped' },
          delivered: { color: 'green', text: 'Delivered' },
          cancelled: { color: 'red', text: 'Cancelled' },
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => {
        // Handle undefined, null, or empty values
        if (total === undefined || total === null) {
          return '₹0.00';
        }
        // Convert to number and format
        const totalNum = Number(total);
        return `₹${!isNaN(totalNum) ? totalNum.toFixed(2) : '0.00'}`;
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => nav(`/admin/orders/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <Button 
              type="link" 
              onClick={() => setAssignModal({ visible: true, orderId: record.id })}
            >
              Assign
            </Button>
          )}
        </Space>
      ),
    },
  ];

  async function handleAssignOrder() {
    if (!selectedDeliveryPerson) {
      message.warning('Please select a delivery person');
      return;
    }

    try {
      const res = await fetch(`${config.baseURL}/api/orders/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_person_id: selectedDeliveryPerson, order_id: assignModal.orderId }),
      });

      if (!res.ok) {
        throw new Error('Failed to assign order');
      }

      message.success('Order assigned successfully');
      setAssignModal({ visible: false, orderId: null });
      setSelectedDeliveryPerson(null);
      fetchOrders();
    } catch (err) {
      console.error('Error assigning order:', err);
      message.error(err.message || 'Failed to assign order');
    }
  }

  return (
    <div className="admin-orders-container">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => nav('/admin')}
        style={{ marginBottom: '16px' }}
      >
        Back to Dashboard
      </Button>

      <Card 
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>Orders Management</Title>
          </Space>
        }
        className="admin-card"
      >
        <Table 
          dataSource={orders} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>

      <Modal
        title="Assign Delivery Person"
        open={assignModal.visible}
        onOk={handleAssignOrder}
        onCancel={() => setAssignModal({ visible: false, orderId: null })}
        okText="Assign"
        cancelText="Cancel"
      >
        <Select
          placeholder="Select delivery person"
          style={{ width: '100%' }}
          onChange={(value) => setSelectedDeliveryPerson(value)}
          value={selectedDeliveryPerson}
        >
          {deliveryPersons.map((person) => (
            <Option key={person.id} value={person.id}>
              {person.name} - {person.phone}
            </Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}
