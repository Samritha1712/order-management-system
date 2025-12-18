import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { loginApi } from '../api/auth.api';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const from = typeof location.state?.from === 'string'
    ? location.state.from
    : (location.state?.from?.pathname || '/');

  const decodeJwtPayload = (token) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  };

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await loginApi({
        email: values.email,
        password: values.password,
      });

      const { accessToken, refreshToken } = response.data;

      // Store tokens and user data
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      const payload = decodeJwtPayload(accessToken);
      localStorage.setItem('userRole', payload.role);
      localStorage.setItem('userId', payload.id);

      // Update auth context
      login({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.email,
      });
      
      // Show success message
      message.success('Login successful! Redirecting...');
      
      // Redirect based on role
      const redirectPath = payload.role === 'admin' ? '/admin' : 
                         payload.role === 'manager' ? '/manager' : 
                         '/products';
      
      // Use React Router for navigation
      navigate(from && from !== '/login' && from !== '/' ? from : redirectPath, { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.error || 'Invalid email or password. Please check your credentials and try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle demo login
  const handleDemoLogin = async (email, password) => {
    try {
      setLoading(true);
      setError('');

      const response = await loginApi({ email, password });
      const { accessToken, refreshToken } = response.data;

      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      const payload = decodeJwtPayload(accessToken);
      localStorage.setItem('userRole', payload.role);
      localStorage.setItem('userId', payload.id);

      login({
        id: payload.id,
        email: payload.email,
        role: payload.role,
        name: payload.email,
      });

      message.success(`Logged in as ${payload.role} successfully!`);

      const redirectPath = payload.role === 'admin' ? '/admin' :
        payload.role === 'manager' ? '/manager' :
        '/products';

      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      console.error('Demo login error:', error);
      const errorMessage = error?.response?.data?.error || 'Failed to login with demo account. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={3} className="login-title">Order Management System</Title>
          <Text type="secondary" className="login-subtitle">Sign in to your account</Text>
        </div>
        
        {error && (
          <Alert
            message="Login Failed"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 24 }}
            onClose={() => setError('')}
          />
        )}
        
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          className="login-form"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="site-form-item-icon" />} 
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
              className="login-form-button"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <div className="demo-accounts">
          <div className="demo-title">
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            <span>Demo Accounts (use exactly)</span>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div>admin@store.com | admin</div>
            <div>manager@store.com | manager</div>
            <div>john.doe@gmail.com | customer</div>
          </div>

          <div className="demo-account" onClick={() => handleDemoLogin('admin@store.com', 'Password123!')}>
            <span>Email: admin@store.com</span>
            <span className="demo-password">Password: Password123!</span>
          </div>
          <div className="demo-account" onClick={() => handleDemoLogin('manager@store.com', 'Password123!')}>
            <span>Email: manager@store.com</span>
            <span className="demo-password">Password: Password123!</span>
          </div>
          <div className="demo-account" onClick={() => handleDemoLogin('john.doe@gmail.com', 'Password123!')}>
            <span>Email: john.doe@gmail.com</span>
            <span className="demo-password">Password: Password123!</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
