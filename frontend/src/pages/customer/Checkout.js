import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Steps, message } from 'antd';
import { ShoppingCartOutlined, UserOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { createOrder } from '../../api/order.api';

const { Title, Text } = Typography;
const { Step } = Steps;

const Checkout = () => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const handleNext = async () => {
    try {
      await form.validateFields(['fullName', 'address', 'city']);
      next();
    } catch (_) {
      // validation errors are shown by antd
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const shippingAddress = [values.address, values.city].filter(Boolean).join(', ');
      const items = (cart || []).map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      await createOrder({
        shipping_address: shippingAddress,
        items,
      });

      clearCart();
      message.success('Order placed successfully');
      next();
    } catch (error) {
      message.error(error?.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Shipping',
      content: (
        <>
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your full name!' }]}
          >
            <Input size="large" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input your address!' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="city"
            label="City"
            rules={[{ required: true, message: 'Please input your city!' }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleNext} disabled={cart.length === 0}>
              Next
            </Button>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Payment',
      content: (
        <div>
          <Form.Item
            name="cardNumber"
            label="Card Number"
            rules={[{ required: true, message: 'Please input your card number!' }]}
          >
            <Input size="large" prefix={<CreditCardOutlined />} placeholder="1234 5678 9012 3456" />
          </Form.Item>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Form.Item
              name="expiryDate"
              label="Expiry Date"
              rules={[{ required: true, message: 'Please input expiry date!' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="MM/YY" size="large" />
            </Form.Item>
            <Form.Item
              name="cvv"
              label="CVV"
              rules={[{ required: true, message: 'Please input CVV!' }]}
              style={{ width: '100px' }}
            >
              <Input.Password placeholder="123" size="large" />
            </Form.Item>
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={prev}>
              Previous
            </Button>
            <Button type="primary" onClick={handlePlaceOrder} loading={loading} disabled={cart.length === 0}>
              Place Order
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Confirmation',
      content: (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
          <Title level={3}>Order Placed Successfully!</Title>
          <Text type="secondary">Your order has been placed and is being processed.</Text>
          <div style={{ marginTop: '24px' }}>
            <Button type="primary" onClick={() => navigate('/my-orders')}>
              View Orders
            </Button>
          </div>
        </div>
      ),
    },
  ];

  // Calculate total
  const total = (cart || []).reduce(
    (sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)),
    0
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Checkout</Title>
      
      <Steps current={current} style={{ marginBottom: '32px' }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <Card title={steps[current].title}>
            <Form form={form} layout="vertical">
              {steps[current].content}
            </Form>
          </Card>
        </div>
        
        <div style={{ width: '300px' }}>
          <Card title="Order Summary">
            {(cart || []).map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div>{item.name}</div>
                  <Text type="secondary">Qty: {item.quantity}</Text>
                </div>
                <div>${(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
