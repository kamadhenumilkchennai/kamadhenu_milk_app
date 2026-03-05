import { Database } from "@/lib/database.types";

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];


/** Product Variant */
export type ProductVariant = {
  label: string;
  price: number;
};

/** Product with typed variants */
export type Product = Omit<Tables<"products">, "variants"> & {
  variants: ProductVariant[];
};

export type CartItem = {
  id: string;
  product: Tables<'products'>;
  product_id: number;
  size: ProductVariant;
  quantity: number;
};

export const OrderStatusList: OrderStatus[] = [
  'New',
  'Cancelled',
  'Delivering',
  'Delivered',
];

export type OrderStatus = 'New' | 'Cancelled' | 'Delivering' | 'Delivered';

export const statusColors: Record<OrderStatus, string> = {
  New: "bg-blue-500 border-blue-500",
  Cancelled: "bg-red-500 border-red-500",
  Delivering: "bg-amber-500 border-amber-500",
  Delivered: "bg-green-500 border-green-500",
};

export type Order = {
  id: number;
  created_at: string;
  total: number;
  user_id: string;
  status: OrderStatus;

  order_items?: OrderItem[];
};

export type OrderItem = {
  id: number;
  product_id: number;
  products: Tables<'products'>;
  order_id: number;
  size: ProductVariant;
  quantity: number;
};

export type SubscriptionPause = {
  id: number;
  subscription_id: number;
  pause_date: string; // yyyy-mm-dd
  reason?: string | null;
  created_at?: string;
};
