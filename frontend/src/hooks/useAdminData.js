import useSWR from "swr";
import { productService } from "../services/productService";
import { warrantyService } from "../services/warrantyService";
import { repairService } from "../services/repairService";
import { userService } from "../services/userService";

const swrConfig = {
  revalidateIfStale: false,    // Không fetch lại nếu đã có dữ liệu cũ
  revalidateOnFocus: false,    // Không fetch lại khi quay lại tab
  revalidateOnReconnect: false, // Không fetch lại khi có mạng lại
  dedupingInterval: 3600000,   // Cache cực mạnh trong 1 giờ
  shouldRetryOnError: false,
};

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/products",
    () => productService.getAllProducts(),
    swrConfig
  );
  return { products: data?.data || [], isLoading, error, mutateProducts: mutate };
}

export function useWarrantiesAdmin() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/warranties",
    () => warrantyService.getAllWarranties(),
    swrConfig
  );
  return { warranties: data?.data || [], isLoading, error, mutateWarranties: mutate };
}

export function useRepairs() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/repair-logs",
    () => repairService.getAllRepairs(),
    swrConfig
  );
  return { repairs: data?.data || [], isLoading, error, mutateRepairs: mutate };
}

export function useUsers() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/users",
    () => userService.getAllUsers(),
    swrConfig
  );
  return { users: data?.data || [], isLoading, error, mutateUsers: mutate };
}
