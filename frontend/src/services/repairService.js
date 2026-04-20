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
    return apiClient.get(`/repair-logs/verify/${serialNumber}`);
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
