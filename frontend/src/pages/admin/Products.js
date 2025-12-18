import React, { useMemo, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../api/product.api';
const Products = () => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const queryClient = useQueryClient();
  const { data: rawProducts = [], isLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAllProducts,
  });
  const products = useMemo(() => {
    return (rawProducts || []).map((p) => ({
      ...p,
      stock: p.stock_quantity ?? p.stock ?? 0,
    }));
  }, [rawProducts]);
  const saveMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        stock_quantity: Number(values.stock_quantity),
        image_url: values.image_url || null,
      };
      if (editingProduct) {
        return updateProduct(editingProduct.id, payload);
      }
      return createProduct(payload);
    },
    onSuccess: () => {
      message.success(`Product ${editingProduct ? 'updated' : 'created'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      setIsModalVisible(false);
      setEditingProduct(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(error?.response?.data?.error || 'Failed to save product');
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      message.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
    onError: (error) => {
      message.error(error?.response?.data?.error || 'Failed to delete product');
    },
  });
  const showModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      form.setFieldsValue({
        name: product.name,
        description: product.description,
        price: Number(product.price),
        stock_quantity: Number(product.stock),
        image_url: product.image_url || '',
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await saveMutation.mutateAsync(values);
    } catch (_) {
      // antd shows validation errors
    }
  };
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: 'Price', dataIndex: 'price', key: 'price', render: (p) => `$${Number(p || 0).toFixed(2)}` },
    { title: 'Stock', dataIndex: 'stock', key: 'stock' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>Product Management</h2>
        <Button type="primary" onClick={() => showModal()}>Add Product</Button>
      </div>
      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={isLoading || deleteMutation.isPending}
        scroll={{ x: true }}
      />
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={saveMutation.isPending}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Product Name" rules={[{ required: true, message: 'Please input the product name!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please input the product description!' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please input the product price!' }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="stock_quantity" label="Stock Quantity" rules={[{ required: true, message: 'Please input the stock quantity!' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="image_url" label="Image URL">
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
export default Products;