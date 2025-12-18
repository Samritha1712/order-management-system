import React, { useMemo, useState } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Steps, 
  Badge, 
  Divider, 
  Typography, 
  Modal, 
  Card, 
  Empty, 
  Tabs, 
  Timeline,
  message
} from 'antd';
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined, 
  CheckOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAllOrders, cancelOrder } from '../../api/order.api';

const { Text } = Typography;
const { TabPane } = Tabs;

// Mock order status timeline
const statusTimeline = {
  pending: [
    { status: 'pending', title: 'Order Placed', description: 'Your order has been received', time: 'Today, 10:30 AM' },
    { status: 'processing', title: 'Processing', description: 'Preparing your order', time: 'Estimated: Today, 2:00 PM' },
    { status: 'shipped', title: 'Shipped', description: 'Your order is on the way', time: 'Estimated: Tomorrow' },
    { status: 'delivered', title: 'Delivered', description: 'Your order has been delivered', time: 'Estimated: 2-3 business days' },
  ],
  processing: [
    { status: 'pending', title: 'Order Placed', description: 'Your order has been received', time: 'Yesterday, 2:30 PM', color: 'green' },
    { status: 'processing', title: 'Processing', description: 'Preparing your order', time: 'In progress', color: 'blue', active: true },
    { status: 'shipped', title: 'Shipped', description: 'Your order is on the way', time: 'Estimated: Tomorrow' },
    { status: 'delivered', title: 'Delivered', description: 'Your order has been delivered', time: 'Estimated: 2-3 business days' },
  ],
  shipped: [
    { status: 'pending', title: 'Order Placed', description: 'Your order has been received', time: 'Dec 10, 10:30 AM', color: 'green' },
    { status: 'processing', title: 'Processing', description: 'Preparing your order', time: 'Completed', color: 'green' },
    { status: 'shipped', title: 'Shipped', description: 'Your order is on the way', time: 'In transit', color: 'blue', active: true },
    { status: 'delivered', title: 'Delivered', description: 'Your order has been delivered', time: 'Estimated: Dec 15' },
  ],
  delivered: [
    { status: 'pending', title: 'Order Placed', description: 'Your order has been received', time: 'Dec 5, 10:30 AM', color: 'green' },
    { status: 'processing', title: 'Processing', description: 'Preparing your order', time: 'Completed', color: 'green' },
    { status: 'shipped', title: 'Shipped', description: 'Your order is on the way', time: 'Completed', color: 'green' },
    { status: 'delivered', title: 'Delivered', description: 'Your order has been delivered', time: 'Dec 8, 2:00 PM', color: 'green' },
  ],
};

const statusIcons = {
  pending: <ClockCircleOutlined style={{ color: '#faad14' }} />,
  processing: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
  shipped: <CarOutlined style={{ color: '#722ed1' }} />,
  delivered: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  cancelled: <CheckCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const statusColors = {
  pending: 'orange',
  processing: 'blue',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const CustomerOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: apiOrders = [], isLoading } = useQuery({
    queryKey: ['customerOrders'],
    queryFn: getAllOrders,
  });

  const orders = useMemo(() => {
    return (apiOrders || []).map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.created_at,
      total: Number(o.total_amount || 0),
      shippingAddress: o.shipping_address,
      items: Array.isArray(o.items) ? o.items : [],
    }));
  }, [apiOrders]);

  const cancelMutation = useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onSuccess: () => {
      message.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      setSelectedOrder(null);
    },
    onError: (error) => {
      message.error(error?.response?.data?.error || 'Failed to cancel order');
    }
  });
  
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (items || []).length,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `$${total.toFixed(2)}`,
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          icon={statusIcons[status] || null} 
          color={statusColors[status] || 'default'}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'All', value: 'all' },
        { text: 'Pending', value: 'pending' },
        { text: 'Processing', value: 'processing' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Delivered', value: 'delivered' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => value === 'all' ? true : record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="link" onClick={() => showOrderDetails(record)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2>My Orders</h2>
        <p>View and track your orders</p>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        tabBarExtraContent={{
          right: (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button icon={<SearchOutlined />}>
                Search Orders
              </Button>
              <Button icon={<FilterOutlined />}>
                Filters
              </Button>
            </div>
          ),
        }}
      >
        <TabPane tab="All Orders" key="all" />
        <TabPane 
          tab={
            <span>
              <ShoppingCartOutlined />
              Pending
            </span>
          } 
          key="pending" 
        />
        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              Processing
            </span>
          } 
          key="processing" 
        />
        <TabPane 
          tab={
            <span>
              <CarOutlined />
              Shipped
            </span>
          } 
          key="shipped" 
        />
        <TabPane 
          tab={
            <span>
              <CheckOutlined />
              Delivered
            </span>
          } 
          key="delivered" 
        />
      </Tabs>

      {filteredOrders.length === 0 ? (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>No orders found</span>
            }
          >
            <Button type="primary" onClick={() => navigate('/products')}>Shop Now</Button>
          </Empty>
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
          loading={isLoading}
        />
      )}

      {/* Order Details Modal */}
      <Modal
        title={`Order #${selectedOrder?.id}`}
        open={!!selectedOrder}
        onCancel={closeOrderDetails}
        footer={[
          <Button key="close" onClick={closeOrderDetails}>
            Close
          </Button>,
          <Button
            key="cancel"
            danger
            onClick={() => cancelMutation.mutate(selectedOrder?.id)}
            loading={cancelMutation.isPending}
            disabled={selectedOrder?.status !== 'pending'}
          >
            Cancel Order
          </Button>,
          <Button 
            key="track" 
            type="primary" 
            onClick={closeOrderDetails}
            disabled={selectedOrder?.status === 'cancelled' || selectedOrder?.status === 'delivered'}
          >
            Track Order
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h3>Order Status</h3>
              <div style={{ marginTop: '16px' }}>
                <Timeline mode="left">
                  {(statusTimeline[selectedOrder.status] || statusTimeline.pending).map((item, index) => (
                    <Timeline.Item 
                      key={index}
                      color={item.color || 'gray'}
                      dot={item.active ? <Badge status="processing" /> : null}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.title}</div>
                        <div>{item.description}</div>
                        <div style={{ color: '#8c8c8c', fontSize: '0.85em' }}>{item.time}</div>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            </div>

            <Divider />

            <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <h3>Shipping Address</h3>
                <p>{selectedOrder.shippingAddress || 'N/A'}</p>
              </div>
              <div style={{ flex: 1 }}>
                <h3>Payment Method</h3>
                <p>Credit Card ending in ****4242</p>
                <p>Paid on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <Divider />

            <h3>Order Items</h3>
            <Table
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              columns={[
                {
                  title: 'Product',
                  dataIndex: 'product_name',
                  key: 'product_name',
                  render: (name) => name || 'N/A',
                },
                {
                  title: 'Quantity',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  width: 100,
                  align: 'center',
                },
                {
                  title: 'Price',
                  dataIndex: 'unit_price',
                  key: 'unit_price',
                  render: (price) => `$${Number(price || 0).toFixed(2)}`,
                  align: 'right',
                  width: 120,
                },
                {
                  title: 'Total',
                  key: 'total',
                  render: (_, record) => `$${(Number(record.quantity || 0) * Number(record.unit_price || 0)).toFixed(2)}`,
                  align: 'right',
                  width: 120,
                },
              ]}
              footer={() => (
                <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  Order Total: ${Number(selectedOrder.total || 0).toFixed(2)}
                </div>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerOrders;
