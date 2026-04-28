export const REPAIR_STATUS_CONFIG = {
  pending: {
    label: "Tiếp nhận",
    background: "var(--status-pending-bg)",
    color: "var(--status-pending)",
    borderColor: "var(--status-pending-border)"
  },
  waiting_parts: {
    label: "Chờ linh kiện",
    background: "var(--status-waiting-bg)",
    color: "var(--status-waiting)",
    borderColor: "var(--status-waiting-border)"
  },
  fixing: {
    label: "Đang sửa",
    background: "var(--status-fixing-bg)",
    color: "var(--status-fixing)",
    borderColor: "var(--status-fixing-border)"
  },
  completed: {
    label: "Sửa xong",
    background: "var(--status-completed-bg)",
    color: "var(--status-completed)",
    borderColor: "var(--status-completed-border)"
  },
  delivered: {
    label: "Đã giao",
    background: "var(--status-delivered-bg)",
    color: "var(--status-delivered)",
    borderColor: "var(--status-delivered-border)"
  },
  cancelled: {
    label: "Đã hủy",
    background: "var(--status-cancelled-bg)",
    color: "var(--status-cancelled)",
    borderColor: "var(--status-cancelled-border)"
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
