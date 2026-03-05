// providers/CartProvider.tsx
import { useInsertOrderItems } from "@/api/order-items";
import { useInsertOrder } from "@/api/orders";
import { Tables } from "@/assets/data/types";
import { supabase } from "@/lib/supabase";
import { randomUUID } from "expo-crypto";
import { useRouter } from "expo-router";
import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

export type Product = Tables<"products">;

export type ProductVariant = {
  label: string;
  price: number;
};

export type CartItem = {
  id: string;
  product_id: number;
  product: Product;
  size: ProductVariant;
  quantity: number;
};

export type SubscriptionData = {
  plan: "weekly" | "monthly";
  startDate: string;
  deliveryTime: "morning" | "evening";
};

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: ProductVariant, quantity?: number) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  removeItem: (itemId: string) => void;
  total: number;
  checkout: (address: Tables<"addresses">, subscription?: SubscriptionData | null) => void;
  isCheckingOut: boolean;
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  total: 0,
  checkout: () => {},
  isCheckingOut: false,
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();
  const { profile } = useAuth();

  const { mutateAsync: insertOrder } = useInsertOrder();
  const { mutateAsync: insertOrderItems } = useInsertOrderItems();

  /* ---------------- ADD ITEM ---------------- */
  const addItem = (product: Product, size: ProductVariant, quantity = 1) => {
    const existingItem = items.find(
      (item) => item.product_id === product.id && item.size.label === size.label
    );

    if (existingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      return;
    }

    setItems((prev) => [
      {
        id: randomUUID(),
        product,
        product_id: product.id,
        size,
        quantity,
      },
      ...prev,
    ]);
  };

  /* ---------------- UPDATE QTY ---------------- */
  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + amount } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* ---------------- REMOVE ---------------- */
  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  /* ---------------- TOTAL ---------------- */
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.size.price * item.quantity, 0),
    [items]
  );

  const clearCart = () => setItems([]);

  /* ---------------- CHECKOUT ---------------- */
const checkout = async (
  address: Tables<"addresses">,
  subscription?: SubscriptionData | null
) => {
  if (!items.length || isCheckingOut || !profile) return;

  setIsCheckingOut(true);

  try {
    let subscriptionId: number | null = null;

    // 1️⃣ Insert subscription
    if (subscription) {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          plan_type: subscription.plan,
          start_date: subscription.startDate,
          delivery_time: subscription.deliveryTime,
          user_id: profile.id,
        })
        .select("id")
        .single();

      if (error) throw error;
      subscriptionId = data.id;
    }

    // 2️⃣ Calculate totals
    const dailyTotal = items.reduce(
      (sum, item) => sum + item.size.price * item.quantity,
      0
    );

    const finalTotal = subscription
      ? subscription.plan === "weekly"
        ? dailyTotal * 7
        : dailyTotal * 30
      : dailyTotal;

    // 3️⃣ Insert order
    const order = await insertOrder({
      total: finalTotal,
      address_id: address.id,
      subscription_id: subscriptionId,
    });

    if (!order?.id) throw new Error("Order ID missing");

    // 4️⃣ Insert order items
    await insertOrderItems(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        variant_label: item.size.label,
        variant_price: item.size.price,
      }))
    );

    clearCart();
    router.replace(`/(user)/orders/${order.id}`);
  } catch (err) {
    console.error("Checkout failed:", err);
  } finally {
    setIsCheckingOut(false);
  }
};


  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        total,
        checkout,
        isCheckingOut,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
export const useCart = () => useContext(CartContext);
