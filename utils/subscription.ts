import { Tables } from "@/assets/data/types";

/* Normalize date to start of day */
export const normalizeDate = (date: Date | string) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* Calculate subscription end date based on plan */
export const calculateEndDate = (
  startDate: string,
  planType: "weekly" | "monthly"
) => {
  const days = planType === "weekly" ? 6 : 29; // inclusive range
  const date = new Date(startDate);
  date.setDate(date.getDate() + days);
  return normalizeDate(date);
};

/* Calculate days left */
export const calculateDaysLeft = (endDate: Date, today: Date = new Date()) => {
  const diff = Math.ceil(
    (normalizeDate(endDate).getTime() - normalizeDate(today).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(diff, 0);
};

/* Get subscription badge info */
export const getSubscriptionBadge = (subscription: Tables<"subscriptions">) => {
  const today = normalizeDate(new Date());
  const startDate = normalizeDate(subscription.start_date);
  const endDate = calculateEndDate(subscription.start_date, subscription.plan_type as "weekly" | "monthly");

  if (today < startDate) return { text: "Upcoming", style: "bg-blue-600" };
  if (today > endDate) return { text: "Expired", style: "bg-red-600" };

  const daysLeft = calculateDaysLeft(endDate, today);
  return {
    text: `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`,
    style: daysLeft <= 2 ? "bg-yellow-500" : "bg-green-600",
  };
};
