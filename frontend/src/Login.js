import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from './api/axios';

const { Title } = Typography;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { accessToken, refreshToken } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Decode token to get user info
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      localStorage.setItem('userRole', payload.role);
      localStorage.setItem('userId', payload.id);
      
      // Call the onLogin callback if provided
      if (onLogin) onLogin();
      
      // Redirect based on role
      switch (payload.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'manager':
          navigate('/manager');
          break;
        case 'customer':
          navigate('/products');
          break;
        default:
          navigate('/');
      }
      
      message.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5',
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>Order Management System</Title>
        </div>
        
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ 
              required: true, 
              message: 'Please input your email!',
              type: 'email'
            }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
              size="large"
            >
              Log in
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <p>Demo Accounts:</p>
            <p><strong>Admin:</strong> admin@store.com / Password123!</p>
            <p><strong>Manager:</strong> manager@store.com / Password123!</p>
            <p><strong>Customer:</strong> john.doe@gmail.com / Password123!</p>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
