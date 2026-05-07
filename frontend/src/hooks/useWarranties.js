import useSWR from "swr";
import { warrantyService } from "../services/warrantyService";

/**
 * useWarranties — Fetch danh sách bảo hành của user hiện tại
 */
function useWarranties(enabled = true) {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR(
    enabled ? "/api/warranties/my-warranties" : null,
    () => warrantyService.getMyWarranties(),
    {
      revalidateOnMount: true, // Luôn làm mới khi component mount
      dedupingInterval: 30000,  // Tăng lên 30s cache
      shouldRetryOnError: false,
    }
  );

  return {
    warranties: data?.data || [],
    isLoading,
    error: error || null,
    mutate,
  };
}

export default useWarranties;
