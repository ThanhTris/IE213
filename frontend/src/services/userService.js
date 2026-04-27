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
   * Update any user's profile (Admin only)
   */
  updateUser: async (walletAddress, payload) => {
    return apiClient.patch(`/users/${walletAddress}`, payload);
  },

  /**
   * Update any user's role (Admin only)
   */
  updateUserRole: async (walletAddress, role) => {
    return apiClient.patch(`/users/${walletAddress}/role`, { role });
  },

  /**
   * Update any user's active status (Admin only)
   */
  updateUserStatus: async (walletAddress, isActive) => {
    return apiClient.patch(`/users/${walletAddress}/is-active`, { isActive });
  },

  /**
   * Get user statistics (Admin only)
   */
  getStats: async () => {
    return apiClient.get("/users/stats");
  }
};
