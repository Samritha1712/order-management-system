import React from 'react';
import { Table, Select, Tag, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUserRole } from '../../api/user.api';
import './AdminUsers.css';
const { Option } = Select;
const Users = () => {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => {
      message.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      message.error(error?.response?.data?.error || 'Failed to update role');
    },
  });
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 90,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <div>
          <div>{`${record.first_name || ''} ${record.last_name || ''}`.trim() || 'N/A'}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => updateRoleMutation.mutate({ userId: record.id, role: value })}
          style={{ width: 140 }}
          disabled={record.role === 'admin'}
          loading={updateRoleMutation.isPending}
        >
          <Option value="admin">Admin</Option>
          <Option value="manager">Manager</Option>
          <Option value="customer">Customer</Option>
        </Select>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="success">Active</Tag>
      ),
    },
  ];
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>User Management</h2>
      </div>
      <Table
        columns={columns}
        dataSource={Array.isArray(users) ? users : []}
        rowKey="id"
        loading={isLoading}
      />
    </div>
  );
};
export default Users;