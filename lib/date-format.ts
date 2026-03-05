export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* ---------------- HELPER ---------------- */
export const formatFriendlyDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";
  if (diffDays === 1) return "Tomorrow";

  // Otherwise, show as "12 Jan"
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" });
  return `${day} ${month}`;
};


export const getSubscriptionEndDate = (
  startDate: string,
  plan: "weekly" | "monthly"
): string => {
  const date = new Date(startDate);

  if (plan === "weekly") {
    date.setDate(date.getDate() + 6);
  }

  if (plan === "monthly") {
    date.setDate(date.getDate() + 29);
  }

  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};
