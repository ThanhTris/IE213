import apiClient from "./apiClient";

export const repairService = {
  /**
   * Get all repair logs (Admin/Staff only)
   */
  getAllRepairs: async (params) => {
    return apiClient.get("/repair-logs", { params });
  },

  /**
   * Get repair history for a specific serial number
   */
  getRepairsBySerial: async (serialNumber) => {
    return apiClient.get(`/repair-logs/device/${serialNumber}`);
  },

  /**
   * Get repair history for all devices of a product model
   */
  getRepairsByModel: async (productCode) => {
    return apiClient.get(`/repair-logs/history-by-model/${productCode}`);
  },

  /**
   * Create a new repair log (Admin/Staff/Technician only)
   */
  createRepair: async (payload) => {
    return apiClient.post("/repair-logs", payload);
  },

  /**
   * Update repair status
   */
  updateRepairStatus: async (id, status) => {
    return apiClient.patch(`/repair-logs/${id}/status`, { status });
  }
};
