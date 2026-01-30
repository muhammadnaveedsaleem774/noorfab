import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "react-query";
import { apiClient } from "./client";
import { getApiErrorMessage } from "./types";
import { cartKeys } from "./cart";
import type { Order, Address } from "@/types";

export interface CreateOrderData {
  items: { productId: string; variantSKU: string; quantity: number }[];
  shippingAddress: Address;
  paymentMethod?: string;
}

export interface OrderResponse extends Order {
  createdAt?: string;
  trackingNumber?: string;
}

/** Create a new order */
export async function createOrder(orderData: CreateOrderData): Promise<OrderResponse> {
  const { data } = await apiClient.post<OrderResponse>("/api/orders", orderData);
  if (!data) throw new Error("Failed to create order");
  return data;
}

/** Fetch current user's orders */
export async function getOrders(): Promise<OrderResponse[]> {
  const { data } = await apiClient.get<OrderResponse[]>("/api/orders");
  return Array.isArray(data) ? data : [];
}

/** Fetch a single order by ID */
export async function getOrderById(orderId: string): Promise<OrderResponse | null> {
  try {
    const { data } = await apiClient.get<OrderResponse>(`/api/orders/${orderId}`);
    return data ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

const ordersKeys = {
  all: ["orders"] as const,
  list: () => [...ordersKeys.all, "list"] as const,
  detail: (id: string) => [...ordersKeys.all, "detail", id] as const,
};

export function useOrders(
  options?: Omit<
    UseQueryOptions<OrderResponse[], Error, OrderResponse[], ReturnType<typeof ordersKeys.list>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ordersKeys.list(),
    queryFn: getOrders,
    ...options,
  });
}

export function useOrderById(
  orderId: string | null,
  options?: Omit<
    UseQueryOptions<OrderResponse | null, Error, OrderResponse | null, ReturnType<typeof ordersKeys.detail>>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ordersKeys.detail(orderId ?? ""),
    queryFn: () => getOrderById(orderId!),
    enabled: !!orderId,
    ...options,
  });
}

export function useCreateOrder(
  options?: UseMutationOptions<OrderResponse, Error, CreateOrderData>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(ordersKeys.all);
      queryClient.invalidateQueries(cartKeys.all);
    },
    ...options,
  });
}

export { getApiErrorMessage as getOrdersErrorMessage };
