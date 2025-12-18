import api from "./axios";

/**
 * Get all orders
 * @returns {Promise} Promise with orders data
 */
export const getAllOrders = async () => {
  try {
    const response = await api.get("/orders");
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Get a single order by ID
 * @param {string} orderId - The ID of the order to fetch
 * @returns {Promise} Promise with order data
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Get orders for a specific user
 * @param {string} userId - The ID of the user
 * @returns {Promise} Promise with user's orders
 */
export const getOrdersByUser = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Create a new order
 * @param {Object} orderData - The order data to create
 * @returns {Promise} Promise with the created order
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders", orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Update order status
 * @param {string} orderId - The ID of the order to update
 * @param {Object} statusData - The new status data
 * @param {string} statusData.status - The new status value
 * @returns {Promise} Promise with the updated order
 */
export const updateOrderStatus = async (orderId, statusData) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, statusData);
    return response.data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error(`Error cancelling order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Delete an order
 * @param {string} orderId - The ID of the order to delete
 * @returns {Promise} Promise indicating success or failure
 */
export const deleteOrder = async (orderId) => {
  try {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Get order statistics
 * @returns {Promise} Promise with order statistics
 */
export const getOrderStatistics = async () => {
  try {
    const response = await api.get("/orders/statistics");
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

/**
 * Get recent orders
 * @param {number} limit - Maximum number of recent orders to return
 * @returns {Promise} Promise with recent orders
 */
export const getRecentOrders = async (limit = 5) => {
  try {
    const response = await api.get(`/orders/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    throw error;
  }
};
