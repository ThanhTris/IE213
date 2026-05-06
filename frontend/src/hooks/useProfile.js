import useSWR from "swr";
import { userService } from "../services/userService";
import { warrantyService } from "../services/warrantyService";

/**
 * useProfile — Fetch thông tin profile + stats của user hiện tại
 * Dùng SWR để tự động cache, dedupe request, và revalidate.
 *
 * @param {boolean} enabled - Chỉ fetch khi true (đã đăng nhập)
 * @returns {{ profile, stats, isLoading, error, mutate }}
 */
function useProfile(enabled = true) {
  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfile,
  } = useSWR(
    enabled ? "/api/users/me" : null,
    () => userService.getMe(),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 giờ
      shouldRetryOnError: false,
    }
  );

  // Chuẩn hóa dữ liệu trả về
  const userData = profileData?.data || {};
  const statsData = userData.stats || { total: 0, active: 0 };
  const profile = {
    fullName: userData.fullName || "",
    email: userData.email || "",
    phone: userData.phone || "",
    role: userData.role || "user",
    isActive: userData.isActive ?? true,
    createdAt: userData.createdAt || null,
  };

  const stats = {
    total: statsData.total || 0,
    active: statsData.active || 0,
  };

  return {
    profile,
    stats,
    isLoading: profileLoading,
    error: profileError || null,
    mutate: () => {
      mutateProfile();
    },
  };
}

export default useProfile;
