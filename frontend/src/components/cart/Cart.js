import React, { useState } from 'react';
import { Drawer, Button, Table, InputNumber, Space, Typography, Divider, Badge, Empty } from 'antd';
import { ShoppingCartOutlined, CloseOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const { Title, Text } = Typography;

const CartDrawer = styled(Drawer)`
  .ant-drawer-header {
    border-bottom: 1px solid #f0f0f0;
  }
  
  .ant-drawer-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const CartFooter = styled.div`
  margin-top: auto;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
`;

const CartTotal = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
`;

const Cart = ({ mode = 'drawer' }) => {
  const { 
    cart, 
    cartCount, 
    cartTotal, 
    cartVisible, 
    removeFromCart, 
    updateQuantity, 
    hideCart, 
    clearCart 
  } = useCart();
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden' }}>
            <img 
              src={record.image || 'https://via.placeholder.com/50'} 
              alt={text}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary">${Number(record.price || 0).toFixed(2)}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.stock || 100}
          value={quantity}
          onChange={(value) => updateQuantity(record.id, value)}
          style={{ width: '70px' }}
        />
      ),
    },
    {
      title: 'Total',
      key: 'total',
      width: 100,
      render: (_, record) => (
        <Text strong>${(Number(record.price || 0) * Number(record.quantity || 0)).toFixed(2)}</Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 50,
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<CloseOutlined />} 
          onClick={() => removeFromCart(record.id)}
        />
      ),
    },
  ];

  const handleCheckout = () => {
    setLoading(true);
    navigate('/checkout');
    if (mode === 'drawer') {
      hideCart();
    }
    setLoading(false);
  };

  const content = cart.length === 0 ? (
    <div style={{ textAlign: 'center', margin: '40px 0' }}>
      <Empty 
        image={Empty.PRESENTED_IMAGE_SIMPLE} 
        description={
          <span>Your cart is empty</span>
        }
      />
      <Button 
        type="primary" 
        onClick={() => {
          if (mode === 'drawer') {
            hideCart();
          }
          navigate('/products');
        }}
        style={{ marginTop: '16px' }}
      >
        Continue Shopping
      </Button>
    </div>
  ) : (
    <>
      <Table
        columns={columns}
        dataSource={cart}
        rowKey="id"
        pagination={false}
        scroll={mode === 'drawer' ? { y: 'calc(100vh - 300px)' } : undefined}
        size="small"
      />
      
      <CartFooter>
        <CartTotal>
          <span>Subtotal:</span>
          <Text strong>${Number(cartTotal || 0).toFixed(2)}</Text>
        </CartTotal>
        <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
          Shipping and taxes calculated at checkout.
        </Text>
        
        <Button 
          type="primary" 
          block 
          size="large"
          onClick={handleCheckout}
          loading={loading}
          icon={<ArrowRightOutlined />}
        >
          Proceed to Checkout
        </Button>
        
        <Button 
          type="text" 
          block 
          style={{ marginTop: '8px' }}
          onClick={clearCart}
          disabled={cart.length === 0}
        >
          Clear Cart
        </Button>
      </CartFooter>
    </>
  );

  if (mode === 'page') {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h2>Cart</h2>
          <p>Review your items before checkout</p>
        </div>
        {content}
      </div>
    );
  }

  return (
    <CartDrawer
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>Your Cart ({cartCount})</span>
        </Space>
      }
      placement="right"
      onClose={hideCart}
      open={cartVisible}
      width={450}
      footer={null}
      closable={true}
    >
      {content}
    </CartDrawer>
  );
};

export default Cart;
