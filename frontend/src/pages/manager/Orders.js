import React, { useMemo, useState } from 'react';
import { Table, Tag, Space, Button, Modal, Descriptions, Select, message, Input } from 'antd';
import { EyeOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, updateOrderStatus } from '../../api/order.api';

const { Search } = Input;
const { Option } = Select;

const orderStatusOptions = [
  { value: 'pending', label: 'Pending', color: 'orange' },
  { value: 'processing', label: 'Processing', color: 'blue' },
  { value: 'shipped', label: 'Shipped', color: 'purple' },
  { value: 'delivered', label: 'Delivered', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const getStatusTag = (status) => {
  const statusObj = orderStatusOptions.find(s => s.value === status) || {};
  return (
    <Tag color={statusObj.color}>
      {statusObj.label || status}
    </Tag>
  );
};

const ManagerOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();
  const { data: apiOrders = [], isLoading } = useQuery({
    queryKey: ['managerOrders'],
    queryFn: getAllOrders,
  });

  const orders = useMemo(() => {
    return (apiOrders || []).map((o) => ({
      id: o.id,
      customer: o.user,
      total: Number(o.total_amount || 0),
      status: o.status,
      createdAt: o.created_at,
      shippingAddress: o.shipping_address,
      items: Array.isArray(o.items) ? o.items : [],
    }));
  }, [apiOrders]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, { status }),
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['managerOrders'] });
      const previous = queryClient.getQueryData(['managerOrders']);

      queryClient.setQueryData(['managerOrders'], (current) => {
        const list = Array.isArray(current) ? current : [];
        return list.map((o) => (String(o.id) === String(orderId) ? { ...o, status } : o));
      });

      return { previous };
    },
    onError: (error, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['managerOrders'], ctx.previous);
      }
      message.error(error?.response?.data?.error || 'Failed to update order status');
    },
    onSuccess: () => {
      message.success('Order status updated successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['managerOrders'] });
    }
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

  const filteredOrders = orders.filter(order => {
    const customerName = order.customer ? `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() : '';
    const customerEmail = order.customer?.email || '';

    const matchesSearch = String(order.id).toLowerCase().includes(searchText.toLowerCase()) ||
      customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <strong>{text}</strong>,
    },
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
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 140 }}
          bordered={false}
          loading={updateStatusMutation.isPending}
        >
          {orderStatusOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      ),
      filters: [
        { text: 'All', value: 'all' },
        ...orderStatusOptions.map(option => ({
          text: option.label,
          value: option.value,
        })),
      ],
      onFilter: (value, record) => value === 'all' ? true : record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showOrderDetails(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <h2>Order Management</h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Search
            placeholder="Search orders..."
            allowClear
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            defaultValue="all"
            style={{ width: 150 }}
            onChange={value => setStatusFilter(value)}
          >
            <Option value="all">All Status</Option>
            {orderStatusOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: true }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
        }}
      />

      <Modal
        title={`Order #${selectedOrder?.id}`}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Order Status">
                {getStatusTag(selectedOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                <div>{selectedOrder.customer ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}` : 'N/A'}</div>
                <div>{selectedOrder.customer?.email || ''}</div>
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address">
                {selectedOrder.shippingAddress}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ margin: '24px 0 16px' }}>Order Items</h3>
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
                  Order Total: ${selectedOrder.total.toFixed(2)}
                </div>
              )}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManagerOrders;
