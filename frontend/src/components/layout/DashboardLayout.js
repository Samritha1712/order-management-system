import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  ShoppingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import Cart from '../cart/Cart';

const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const adminMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: 'users',
      icon: <UserSwitchOutlined />,
      label: <Link to="/admin/users">Manage Users</Link>,
    },
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: 'orders',
      icon: <UnorderedListOutlined />,
      label: <Link to="/admin/orders">All Orders</Link>,
    },
  ];

  const managerMenuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/manager">Dashboard</Link>,
    },
    {
      key: 'orders',
      icon: <UnorderedListOutlined />,
      label: <Link to="/manager/orders">Orders</Link>,
    },
  ];

  const customerMenuItems = [
    {
      key: 'products',
      icon: <ShoppingOutlined />,
      label: <Link to="/products">Products</Link>,
    },
    {
      key: 'orders',
      icon: <UnorderedListOutlined />,
      label: <Link to="/my-orders">My Orders</Link>,
    },
    {
      key: 'cart',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/cart">Cart</Link>,
    },
  ];

  const getMenuItems = () => {
    if (!user) return [];
    if (user.role === 'admin') return adminMenuItems;
    if (user.role === 'manager') return managerMenuItems;
    return customerMenuItems;
  };

  // Get the current path to set the selected menu item
  const getSelectedKey = () => {
    const path = window.location.pathname;
    if (path.includes('/admin')) {
      if (path.includes('/users')) return 'users';
      if (path.includes('/products')) return 'products';
      if (path.includes('/orders')) return 'orders';
      return 'dashboard';
    } else if (path.includes('/manager')) {
      if (path.includes('/orders')) return 'orders';
      return 'dashboard';
    } else {
      if (path.includes('/my-orders')) return 'orders';
      if (path.includes('/cart')) return 'cart';
      return 'products';
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} className="site-layout-background">
        <div className="logo" style={{ padding: '16px', color: 'white', textAlign: 'center' }}>
          <h2>Order Management</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={getMenuItems()}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout className="site-layout">
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
        }}>
          <h2 style={{ margin: 0, color: '#1890ff' }}>
            {user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Manager' : 'My'} Dashboard
          </h2>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Avatar 
                icon={<UserOutlined />} 
                style={{ 
                  marginRight: 8,
                  backgroundColor: user?.role === 'admin' ? '#f5222d' : 
                                 user?.role === 'manager' ? '#fa8c16' : '#52c41a'
                }} 
              />
              <span style={{ fontWeight: 500 }}>{user?.name || user?.email || 'User'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: '24px 16px 0', 
          overflow: 'initial',
          minHeight: 'calc(100vh - 112px)'
        }}>
          <div className="site-layout-background" style={{ 
            padding: 24, 
            minHeight: '100%',
            background: '#fff',
            borderRadius: 4,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
          }}>
            {children}
          </div>
        </Content>
      </Layout>
      <Cart />
    </Layout>
  );
};

export default DashboardLayout;
