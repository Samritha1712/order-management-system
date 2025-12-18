import React, { useMemo, useState } from 'react';
import { Table, Tag, Space, Button, Modal, Descriptions, Select, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, updateOrderStatus } from '../../api/order.api';
const orderStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];
const getStatusTag = (status) => {
  const statusObj = orderStatusOptions.find(s => s.value === status) || {};
  return <Tag color={statusObj.color}>{statusObj.label || status}</Tag>;
};
const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const { data: apiOrders = [], isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAllOrders,
  });
  const orders = useMemo(() => {
    return (apiOrders || []).map((o) => ({
      id: o.id,
      customer: o.user,
      items: Array.isArray(o.items) ? o.items : [],
      total: Number(o.total_amount || 0),
      status: o.status,
      createdAt: o.created_at,
      shippingAddress: o.shipping_address,
    }));
  }, [apiOrders]);
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      message.success('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    },
    onError: (error) => {
      message.error(error?.response?.data?.error || 'Failed to update order status');
    },
  });
  const handleStatusChange = (orderId, status) => {
    updateStatusMutation.mutate({ orderId, status });
  };
  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };
  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id', render: (text) => <strong>{text}</strong> },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div>
          <div>{customer ? `${customer.first_name} ${customer.last_name}` : 'N/A'}</div>
          <div style={{ color: '#888', fontSize: '0.8em' }}>{customer?.email || ''}</div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => (date ? new Date(date).toLocaleDateString() : 'N/A'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    { title: 'Total', dataIndex: 'total', key: 'total', render: (t) => `$${Number(t || 0).toFixed(2)}` },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 140 }}
          bordered={false}
          loading={updateStatusMutation.isPending}
        >
          {orderStatusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => showOrderDetails(record)}>
          View
        </Button>
      ),
    },
  ];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>Order Management</h2>
      </div>
      <Table columns={columns} dataSource={orders} rowKey="id" loading={isLoading} scroll={{ x: true }} />
      <Modal
        title={`Order #${selectedOrder?.id}`}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[<Button key="close" onClick={handleCloseModal}>Close</Button>]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Order Status">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                <div>{selectedOrder.customer ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : 'N/A'}</div>
                <div>{selectedOrder.customer?.email || ''}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address">{selectedOrder.shippingAddress || 'N/A'}</Descriptions.Item>
            </Descriptions>
            <h3 style={{ margin: '24px 0 16px' }}>Order Items</h3>
            <Table
              dataSource={selectedOrder.items}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Product', dataIndex: 'product_name', key: 'product_name', render: (n) => n || 'N/A' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity', width: 100, align: 'center' },
                { title: 'Price', dataIndex: 'unit_price', key: 'unit_price', align: 'right', width: 120, render: (p) => `$${Number(p || 0).toFixed(2)}` },
                { title: 'Total', key: 'total', align: 'right', width: 120, render: (_, r) => `$${(Number(r.quantity || 0) * Number(r.unit_price || 0)).toFixed(2)}` },
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
export default Orders;