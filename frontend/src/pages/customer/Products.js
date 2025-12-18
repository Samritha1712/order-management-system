import React, { useMemo, useState } from 'react';
import { Card, Row, Col, Input, Button, InputNumber, Badge, Tag, message, Select } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, StarFilled, ThunderboltOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getAllProducts } from '../../api/product.api';
import './Products.css';

const { Search } = Input;
const { Option } = Select;

const Products = () => {
  const [searchText, setSearchText] = useState('');
  const [quantity, setQuantity] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const navigate = useNavigate();
  const { addToCart, showCart } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  });

  const handleAddToCart = (product) => {
    const qty = quantity[product.id] || 1;
    if (qty < 1) {
      message.warning('Please enter a valid quantity');
      return;
    }
    
    if (qty > product.stock) {
      message.warning(`Only ${product.stock} items available`);
      return;
    }
    
    addToCart({
      ...product,
      quantity: qty,
    });
    
    message.success(`${product.name} added to cart`);
    showCart();
    setQuantity(prev => ({ ...prev, [product.id]: 1 }));
  };

  const handleBuyNow = (product) => {
    const qty = quantity[product.id] || 1;
    if (qty < 1) {
      message.warning('Please enter a valid quantity');
      return;
    }

    if (qty > product.stock) {
      message.warning(`Only ${product.stock} items available`);
      return;
    }

    addToCart({
      ...product,
      quantity: qty,
    });
    setQuantity(prev => ({ ...prev, [product.id]: 1 }));
    navigate('/checkout');
  };

  const filteredProducts = useMemo(() => {
    return (products || [])
      .map((p) => ({
        ...p,
        id: p.id ?? p.product_id,
        price: Number(p.price ?? 0),
        stock: Number(p.stock_quantity ?? p.stock ?? 0),
      }))
      .filter(product =>
        product?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        product?.description?.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [products, searchText, sortBy]);

  const handleQuantityChange = (value, productId) => {
    setQuantity(prev => ({
      ...prev,
      [productId]: value,
    }));
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h2>Our Products</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Search
            placeholder="Search products..."
            allowClear
            onSearch={value => setSearchText(value)}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="Sort by"
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 150 }}
          >
            <Option value="name">Name</Option>
            <Option value="price-low">Price: Low to High</Option>
            <Option value="price-high">Price: High to Low</Option>
          </Select>
        </div>
      </div>

      <Row gutter={[16, 24]}>
        {filteredProducts.map(product => (
          <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
            <Badge.Ribbon 
              text={product.stock > 0 ? 'In Stock' : 'Out of Stock'} 
              color={product.stock > 0 ? 'green' : 'red'}
            >
              <Card
                className="product-card"
                hoverable
                cover={
                  <div style={{ 
                    height: 200, 
                    background: `url(${product.image || 'https://via.placeholder.com/300'}) center/cover no-repeat` 
                  }} />
                }
                actions={[
                  <div key="quantity" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Qty:</span>
                    <InputNumber 
                      min={1} 
                      max={product.stock} 
                      defaultValue={1} 
                      value={quantity[product.id] || 1}
                      onChange={(value) => handleQuantityChange(value, product.id)}
                      style={{ width: '84px' }}
                      disabled={product.stock === 0}
                    />
                  </div>,
                  <Button 
                    key="add-to-cart" 
                    type="primary" 
                    icon={<ShoppingCartOutlined />}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    block
                  >
                    Add to Cart
                  </Button>,
                  <Button
                    key="buy-now"
                    type="primary"
                    icon={<ThunderboltOutlined />}
                    onClick={() => handleBuyNow(product)}
                    disabled={product.stock === 0}
                    block
                  >
                    Buy Now
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={product.name}
                  description={
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        {product.description.length > 60 
                          ? `${product.description.substring(0, 60)}...` 
                          : product.description}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#1890ff' }}>
                          ${product.price.toFixed(2)}
                        </span>
                        <div>
                          <StarFilled style={{ color: '#faad14' }} />
                          <span> {product.rating || '4.5'}</span>
                        </div>
                      </div>
                      {product.discount > 0 && (
                        <div style={{ marginTop: '8px' }}>
                          <Tag color="red">
                            {product.discount}% OFF
                          </Tag>
                          <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '8px' }}>
                            ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  }
                />
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Products;
