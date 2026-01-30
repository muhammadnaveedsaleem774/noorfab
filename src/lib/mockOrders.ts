import type { Order, Address } from "@/types";
import { ORDER_STATUS } from "@/lib/constants";

const mockAddress: Address = {
  id: "addr-1",
  userId: "user-1",
  fullName: "Jane Doe",
  phone: "+1234567890",
  street: "123 Main St",
  city: "Lahore",
  state: "Punjab",
  postalCode: "54000",
  country: "Pakistan",
  isDefault: true,
};

export interface OrderWithDate extends Order {
  createdAt?: string;
  trackingNumber?: string;
}

export const MOCK_ORDERS: OrderWithDate[] = [
  {
    id: "ord-1",
    orderNumber: "ALN-ABC123",
    userId: "user-1",
    items: [
      { productId: "1", variantSKU: "ALT-CT-001-M-W", quantity: 2, unitPrice: 2999 },
      { productId: "2", variantSKU: "ALT-SL-002-M-S", quantity: 1, unitPrice: 5999 },
    ],
    shippingAddress: mockAddress,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "PAID",
    orderStatus: ORDER_STATUS.DELIVERED,
    subtotal: 11997,
    shippingFee: 500,
    totalAmount: 12497,
    createdAt: "2025-01-15T10:00:00Z",
    trackingNumber: "TRK123456789",
  },
  {
    id: "ord-2",
    orderNumber: "ALN-DEF456",
    userId: "user-1",
    items: [
      { productId: "3", variantSKU: "ALT-LK-003-M-P", quantity: 1, unitPrice: 3999 },
    ],
    shippingAddress: { ...mockAddress, id: "addr-2", street: "456 Oak Ave" },
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "PENDING",
    orderStatus: ORDER_STATUS.SHIPPED,
    subtotal: 3999,
    shippingFee: 500,
    totalAmount: 4499,
    createdAt: "2025-01-25T14:30:00Z",
    trackingNumber: "TRK987654321",
  },
  {
    id: "ord-3",
    orderNumber: "ALN-GHI789",
    userId: "user-1",
    items: [
      { productId: "1", variantSKU: "ALT-CT-001-S-W", quantity: 1, unitPrice: 2999 },
      { productId: "4", variantSKU: "ALT-CP-004-M-W", quantity: 1, unitPrice: 3499 },
    ],
    shippingAddress: mockAddress,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "PENDING",
    orderStatus: ORDER_STATUS.PROCESSING,
    subtotal: 6498,
    shippingFee: 500,
    totalAmount: 6998,
    createdAt: "2025-01-28T09:00:00Z",
  },
];
