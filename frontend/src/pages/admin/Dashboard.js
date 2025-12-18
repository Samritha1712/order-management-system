import React, { useMemo } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, Button, Typography, Spin } from 'antd';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '../../api/order.api';
import { getAdminStats } from '../../api/admin.api';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStats,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAllOrders,
  });

  const recentOrders = useMemo(() => {
    return [...(orders || [])].slice(0, 5);
  }, [orders]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <UserOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: <ShoppingOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: <ShoppingCartOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      color: '#722ed1',
    },
    {
      title: 'Total Revenue',
      value: `$${Number(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: <DollarOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
      color: '#faad14',
    },
  ];

  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => {
        const safeId = id == null ? '' : String(id);
        return `#${safeId.slice(0, 8)}`;
      }
    },
    {
      title: 'Customer',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user ? `${user.first_name} ${user.last_name}` : 'N/A'
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'geekblue';
        if (status === 'completed') color = 'green';
        if (status === 'cancelled') color = 'red';
        if (status === 'pending') color = 'orange';
        
        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => {/* View order details */}}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  const loading = statsLoading || ordersLoading;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Admin Dashboard</Title>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Row gutter={16} align="middle">
                <Col>
                  <div style={{ padding: '12px', background: `${stat.color}1a`, borderRadius: '8px' }}>
                    {stat.icon}
                  </div>
                </Col>
                <Col flex="auto">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    style={{ marginBottom: 0 }}
                  />
                  <div style={{ marginTop: 4 }} />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Recent Orders */}
      <Card 
        title="Recent Orders" 
        extra={<Link to="/admin/orders">View All</Link>}
        style={{ marginBottom: '24px' }}
      >
        <Table 
          columns={orderColumns} 
          dataSource={recentOrders} 
          rowKey="id"
          pagination={false}
        />
      </Card>

      {/* Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Order Status" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card type="inner" title="Pending" extra={`${stats?.pendingOrders || 0} orders`}>
                  <div style={{ textAlign: 'center' }}>
                    <ShoppingCartOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card type="inner" title="Delivered" extra={`${stats?.deliveredOrders || 0} orders`}>
                  <div style={{ textAlign: 'center' }}>
                    <ShoppingCartOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block>
                <Link to="/admin/products/new">Add New Product</Link>
              </Button>
              <Button block>
                <Link to="/admin/users/new">Add New User</Link>
              </Button>
              <Button block>
                <Link to="/admin/orders">Manage Orders</Link>
              </Button>
              <Button block>
                <Link to="/admin/reports">View Reports</Link>
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* Add more dashboard widgets here */}
    </div>
  );
};

export default AdminDashboard;
