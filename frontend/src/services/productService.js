import apiClient from "./apiClient";

export const productService = {
  /**
   * Get all products
   */
  getAllProducts: async () => {
    return apiClient.get("/products");
  },

  /**
   * Get product by code
   */
  getProductByCode: async (code) => {
    return apiClient.get(`/products/${code}`);
  },

  /**
   * Create a new product (Admin only)
   */
  createProduct: async (payload) => {
    return apiClient.post("/products", payload);
  },

  /**
   * Update a product (Admin only)
   */
  updateProduct: async (idOrCode, payload) => {
    // payload can be FormData if uploading image
    return apiClient.put(`/products/${idOrCode}`, payload);
  },

  /**
   * Delete a product (Admin only - Soft Delete)
   */
  deleteProduct: async (idOrCode) => {
    return apiClient.delete(`/products/${idOrCode}`);
  }
};
