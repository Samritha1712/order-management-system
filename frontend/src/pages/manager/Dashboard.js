import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Typography, 
  Select, 
  message,
  Badge,
  Spin
} from 'antd';
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, updateOrderStatus } from '../../api/order.api';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

// Status tag component
const StatusTag = ({ status }) => {
  let color = 'default';
  let icon = null;
  
  switch (status) {
    case 'pending':
      color = 'warning';
      icon = <ClockCircleOutlined />;
      break;
    case 'processing':
      color = 'processing';
      icon = <SyncOutlined spin />;
      break;
    case 'shipped':
      color = 'processing';
      icon = <SyncOutlined />;
      break;
    case 'delivered':
      color = 'success';
      icon = <CheckCircleOutlined />;
      break;
    case 'cancelled':
      color = 'error';
      icon = <CloseCircleOutlined />;
      break;
    default:
      color = 'default';
  }
  
  return (
    <Tag icon={icon} color={color}>
      {status.toUpperCase()}
    </Tag>
  );
};

const ManagerDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['managerOrders'],
    queryFn: getAllOrders,
    select: (data) => Array.isArray(data) ? data : []
  });

  // Update order status mutation
  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      message.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['managerOrders'] });
    },
    onError: (error) => {
      message.error(error.response?.data?.message || 'Failed to update order status');
    }
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const shippedOrders = orders.filter(order => order.status === 'shipped').length;
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
  
  // Filter orders based on status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Stats cards data
  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: <ShoppingCartOutlined style={{ fontSize: '32px', color: '#1890ff' }} />,
      color: '#1890ff',
      change: 12,
      changeType: 'increase'
    },
    {
      title: 'Pending',
      value: pendingOrders,
      icon: <ClockCircleOutlined style={{ fontSize: '32px', color: '#faad14' }} />,
      color: '#faad14',
      change: 5,
      changeType: 'increase'
    },
    {
      title: 'Processing',
      value: processingOrders,
      icon: <SyncOutlined spin style={{ fontSize: '32px', color: '#1890ff' }} />,
      color: '#1890ff',
      change: 3,
      changeType: 'increase'
    },
    {
      title: 'Shipped',
      value: shippedOrders,
      icon: <SyncOutlined style={{ fontSize: '32px', color: '#722ed1' }} />,
      color: '#722ed1',
      change: 8,
      changeType: 'decrease'
    },
    {
      title: 'Delivered',
      value: deliveredOrders,
      icon: <CheckCircleOutlined style={{ fontSize: '32px', color: '#52c41a' }} />,
      color: '#52c41a',
      change: 15,
      changeType: 'increase'
    },
  ];

  // Orders table columns
  const columns = [
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
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'amount',
      render: (amount) => `$${parseFloat(amount || 0).toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusTag status={status} />
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
          {record.status !== 'delivered' && record.status !== 'cancelled' && (
            <Select
              defaultValue={record.status}
              style={{ width: 120 }}
              onChange={(value) => updateStatus({ orderId: record.id, status: value })}
              size="small"
            >
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Order Management</Title>
      
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={4} key={index}>
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
                  <div style={{ marginTop: 4 }}>
                    <Text type={stat.changeType === 'increase' ? 'success' : 'danger'}>
                      {stat.changeType === 'increase' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {stat.change}% from last month
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Orders Table */}
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>All Orders</span>
            <Select 
              defaultValue="all" 
              style={{ width: 200 }}
              onChange={setStatusFilter}
            >
              <Option value="all">All Orders</Option>
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>
        }
      >
        <Table 
          columns={columns} 
          dataSource={filteredOrders} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          loading={isLoading}
        />
      </Card>
      
      {/* Recent Orders */}
      <Card 
        title="Recent Orders" 
        style={{ marginTop: '24px' }}
        extra={<Link to="/manager/orders">View All</Link>}
      >
        <Table 
          columns={columns.filter(col => ['id', 'user', 'date', 'amount', 'status'].includes(col.key))}
          dataSource={recentOrders} 
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ManagerDashboard;
