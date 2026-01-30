import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from "react-query";
import { apiClient } from "./client";
import { getApiErrorMessage } from "./types";
import type { User, Address } from "@/types";

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
}

export interface UserProfileResponse extends User {}

/** Update current user profile */
export async function updateProfile(data: UpdateProfileData): Promise<UserProfileResponse> {
  const { data: res } = await apiClient.patch<UserProfileResponse>("/api/user/profile", data);
  if (!res) throw new Error("Failed to update profile");
  return res;
}

/** Fetch current user's saved addresses */
export async function getAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<Address[]>("/api/user/addresses");
  return Array.isArray(data) ? data : [];
}

export interface AddAddressData {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

/** Add a new address */
export async function addAddress(address: AddAddressData): Promise<Address> {
  const { data } = await apiClient.post<Address>("/api/user/addresses", address);
  if (!data) throw new Error("Failed to add address");
  return data;
}

/** Update an existing address */
export async function updateAddress(id: string, address: Partial<AddAddressData>): Promise<Address> {
  const { data } = await apiClient.patch<Address>(`/api/user/addresses/${id}`, address);
  if (!data) throw new Error("Failed to update address");
  return data;
}

/** Delete an address */
export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/api/user/addresses/${id}`);
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

const userKeys = {
  profile: ["user", "profile"] as const,
  addresses: ["user", "addresses"] as const,
};

export function useUpdateProfile(
  options?: UseMutationOptions<UserProfileResponse, Error, UpdateProfileData>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.profile);
    },
    ...options,
  });
}

export function useAddresses(
  options?: Omit<
    UseQueryOptions<Address[], Error, Address[], (typeof userKeys)["addresses"]>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: userKeys.addresses,
    queryFn: getAddresses,
    ...options,
  });
}

export function useAddAddress(
  options?: UseMutationOptions<Address, Error, AddAddressData>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.addresses);
    },
    ...options,
  });
}

export function useUpdateAddress(
  options?: UseMutationOptions<Address, Error, { id: string; address: Partial<AddAddressData> }>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, address }) => updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.addresses);
    },
    ...options,
  });
}

export function useDeleteAddress(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(userKeys.addresses);
    },
    ...options,
  });
}

export { getApiErrorMessage as getUserErrorMessage };
