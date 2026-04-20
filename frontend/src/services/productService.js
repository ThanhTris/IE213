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
  }
};
