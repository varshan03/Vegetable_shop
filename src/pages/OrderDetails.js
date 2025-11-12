import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, Avatar, Tag, Typography, Spin, message, Button, Divider, Space, Modal } from "antd";
import { ArrowLeftOutlined, AimOutlined } from "@ant-design/icons";
import config from "../server";
import "../theme.css";
import companyLogoUrl from '../Images/logo.jpg';
const { Title, Text } = Typography;

export default function OrderDetails() {
  const { orderId } = useParams();
  const nav = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

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
console.log(order,'testing');

  if (loading) {
    return <div className="center-loader"><Spin size="large" /></div>;
  }

  if (!order) {
    return (
      <div className="orders-container">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => nav(-1)} style={{ marginBottom: 16 }}>
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

  function formatCurrency(n){
    return `₹${Number(n || 0).toFixed(2)}`;
  }

  // const companyLogoUrl = `${config.baseURL}/logo.png`;

  function buildInvoiceHTML(order, autoPrint = true){
    const itemsRows = (order.items || []).map((it, idx) => {
      const qty = Number(it.quantity);
      const price = Number(it.price);
      const amount = qty * price;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td>${it.name || ''}</td>
          <td style="text-align:right;">${qty}</td>
          <td style="text-align:right;">${formatCurrency(price)}</td>
          <td style="text-align:right;">${formatCurrency(amount)}</td>
        </tr>
      `;
    }).join('');

    const total = Number(order.total_price || 0);

    const address = order.delivery_address ? `
      <div class="row">
        <div class="label">Delivery Address:</div>
        <div class="value">${order.delivery_address}</div>
      </div>
    ` : '';

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Invoice #${order.order_id}</title>
          <style>
            body{ font-family: Arial, Helvetica, sans-serif; color:#222; margin:0; padding:24px; }
            .invoice{ max-width: 800px; margin: 0 auto; }
            .header{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }
            .brand-row{ display:flex; align-items:center; gap:12px; }
            .brand{ font-size:24px; font-weight:700; }
            .logo{ height:100px; width:auto; object-fit:contain; }
            .meta{ text-align:right; font-size:14px; }
            .section{ background:#fafafa; border:1px solid #eee; padding:12px 16px; border-radius:8px; margin-bottom:16px; }
            .row{ display:flex; gap:8px; margin:4px 0; }
            .label{ width:160px; color:#555; }
            .value{ flex:1; }
            table{ width:100%; border-collapse:collapse; margin-top:8px; }
            th, td{ padding:10px; border-bottom:1px solid #eee; font-size:14px; }
            th{ background:#f5f5f5; text-align:left; }
            tfoot td{ font-weight:700; border-top:2px solid #ddd; }
            .footer{ text-align:center; margin-top:24px; color:#666; font-size:12px; }
            @media print { .no-print{ display:none !important; } }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <div class="brand-row">
                <img class="logo" src="${companyLogoUrl}" alt="Logo" onerror="this.style.display='none'" />
                <div class="brand">RR Fresh Delivery</div>
              </div>
              <div class="meta">
                <div><strong>Invoice</strong></div>
                <div>#${order.order_id}</div>
                <div>${createdOn}</div>
              </div>
            </div>

            <div class="section">
              <div class="row"><div class="label">Customer:</div><div class="value">${order.customer_name || '-'}</div></div>
              ${address}
              <div class="row"><div class="label">Payment:</div><div class="value">${(order.payment_method || 'COD').toString().toUpperCase()}</div></div>
              <div class="row"><div class="label">Status:</div><div class="value">${String(order.status || '').replace('_',' ').toUpperCase()}</div></div>
            </div>

            <div class="section">
              <table>
                <thead>
                  <tr>
                    <th style="width:48px;">#</th>
                    <th>Item</th>
                    <th style="text-align:right;width:100px;">Qty</th>
                    <th style="text-align:right;width:120px;">Price</th>
                    <th style="text-align:right;width:140px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="text-align:right;">Total</td>
                    <td style="text-align:right;">${formatCurrency(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="footer">Thank you for your purchase!</div>
          </div>
          ${autoPrint ? '<script>window.print();</script>' : ''}
        </body>
      </html>
    `;
  }

  function handlePrint(){
    try{
      const html = buildInvoiceHTML(order, true);
      const win = window.open('', '_blank', 'width=900,height=700');
      if(!win){ alert('Please allow popups to print the invoice.'); return; }
      win.document.open();
      win.document.write(html);
      win.document.close();
      // Some browsers need a slight delay before print when writing dynamic HTML
      setTimeout(() => { try { win.focus(); } catch(e){} }, 100);
    }catch(e){
      console.error(e);
      message.error('Could not generate invoice');
    }
  }

  function handlePreview(){
    try{
      const html = buildInvoiceHTML(order, false);
      setPreviewHtml(html);
      setPreviewOpen(true);
    }catch(e){
      console.error(e);
      message.error('Could not generate preview');
    }
  }

  return (
    <div className="orders-container">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => nav(-1)} style={{ marginRight: 16 }}>
          Back to Orders
        </Button>
        <Title level={2} style={{ margin: 0, flex: 1 }}>Order #{order.order_id}</Title>
        <Space>
          <Button onClick={handlePreview} className="no-print">Preview Invoice</Button>
          {/* <Button type="primary" onClick={handlePrint} className="no-print">Print Invoice</Button> */}
        </Space>
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
      <Modal
        title={`Invoice Preview #${order.order_id}`}
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setPreviewOpen(false)}>Close</Button>,
          <Button key="print" type="primary" onClick={() => { setPreviewOpen(false); handlePrint(); }}>Print</Button>,
        ]}
        bodyStyle={{ padding: 0 }}
      >
        <iframe
          title="invoice-preview"
          srcDoc={previewHtml}
          style={{ width: '100%', height: '75vh', border: 'none' }}
        />
      </Modal>
    </div>
  );
}
