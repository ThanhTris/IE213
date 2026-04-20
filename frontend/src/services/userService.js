import apiClient from "./apiClient";

export const userService = {
  /**
   * Authenticate user with wallet and signature (or payload)
   */
  login: async (payload) => {
    return apiClient.post("/users/auth", payload);
  },

  /**
   * Get current user profile
   */
  getMe: async () => {
    return apiClient.get("/users/me");
  },

  /**
   * Update current user profile
   */
  updateProfile: async (payload) => {
    return apiClient.put("/users/me", payload);
  },

  /**
   * Get all users (Admin only)
   */
  getAllUsers: async () => {
    return apiClient.get("/users");
  },

  /**
   * Get user statistics (Admin only)
   */
  getStats: async () => {
    return apiClient.get("/users/stats");
  }
};
