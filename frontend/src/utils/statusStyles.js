export const REPAIR_STATUS_CONFIG = {
  pending: {
    label: "Tiếp nhận",
    background: "#eff6ff",
    color: "#2563eb",
    borderColor: "#bfdbfe"
  },
  waiting_parts: {
    label: "Chờ linh kiện",
    background: "#fffbeb",
    color: "#d97706",
    borderColor: "#fde68a"
  },
  fixing: {
    label: "Đang sửa",
    background: "#f5f3ff",
    color: "#7c3aed",
    borderColor: "#ddd6fe"
  },
  completed: {
    label: "Sửa xong",
    background: "#ecfdf5",
    color: "#059669",
    borderColor: "#a7f3d0"
  },
  delivered: {
    label: "Đã giao",
    background: "#f0fdfa",
    color: "#0d9488",
    borderColor: "#99f6e4"
  },
  cancelled: {
    label: "Đã hủy",
    background: "#fef2f2",
    color: "#dc2626",
    borderColor: "#fecaca"
  }
};

export const getStatusConfig = (status) => {
  return REPAIR_STATUS_CONFIG[status] || {
    label: status || "Không xác định",
    background: "#f1f5f9",
    color: "#475569",
    borderColor: "#e2e8f0"
  };
};
