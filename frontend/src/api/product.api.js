import api from "./axios";

export const getAllProducts = async () => {
  try {
    const response = await api.get("/products");
    // Ensure we always return an array, even if the response structure is different
    if (Array.isArray(response?.data)) {
      return response.data;
    } else if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data; // Handle case where data is nested under a data property
    } else if (response?.data?.products && Array.isArray(response.data.products)) {
      return response.data.products; // Handle case where products are nested under a products property
    }
    console.error('Unexpected API response format:', response);
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Let React Query handle the error
  }
};



export const createProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};








