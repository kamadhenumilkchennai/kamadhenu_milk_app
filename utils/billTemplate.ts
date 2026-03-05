import { Tables } from "@/assets/data/types";
import { BRANDING } from "./branding";

/* -------------------------------- TYPES -------------------------------- */

type OrderWithRelations = Tables<"orders"> & {
  order_items: (Tables<"order_items"> & {
    products?: Tables<"products"> | null;
  })[];
  addresses?: Tables<"addresses"> | null;
  profiles?: Tables<"profiles"> | null;
  subscription?: Tables<"subscriptions"> | null;
};

/* -------------------------------- CONSTANTS -------------------------------- */

const PLAN_DAYS = {
  weekly: 7,
  monthly: 30,
} as const;

const BRAND_LOGO = BRANDING.logo;
const SIGNATURE_IMAGE = BRANDING.signature;
const BRAND_NAME = BRANDING.name;

/* -------------------------------- HELPERS -------------------------------- */

/**
 * Converts number to Indian currency words
 * Example: 1234.50 → Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only
 */
const numberToWords = (amount: number) => {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (num: number): string => {
    if (num === 0) return "Zero";
    if (num < 20) return a[num];
    if (num < 100) return b[Math.floor(num / 10)] + " " + a[num % 10];
    if (num < 1000)
      return a[Math.floor(num / 100)] + " Hundred " + inWords(num % 100);
    if (num < 100000)
      return (
        inWords(Math.floor(num / 1000)) + " Thousand " + inWords(num % 1000)
      );
    if (num < 10000000)
      return (
        inWords(Math.floor(num / 100000)) + " Lakh " + inWords(num % 100000)
      );
    return "";
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  return `Rupees ${inWords(rupees)}${
    paise ? ` and ${inWords(paise)} Paise` : ""
  } Only`;
};

/* -------------------------------- TEMPLATE -------------------------------- */

export const generateBillHTML = ({
  order,
  itemsTotal,
  deliveryCharge,
  skippedDates = [], // Array of skipped dates as strings "YYYY-MM-DD"
}: {
  order: OrderWithRelations;
  itemsTotal: number;
  deliveryCharge: number;
  skippedDates?: string[];
}) => {
  const billDate = new Date();
  const orderDate = new Date(order.created_at);

  const isSubscribed = Boolean(order.subscription);
  const plan = order.subscription?.plan_type ?? null;

  const days =
    plan && plan in PLAN_DAYS ? PLAN_DAYS[plan as "weekly" | "monthly"] : 1;

  const skippedDaysCount = skippedDates.length; // Number of skipped days
  const effectiveDays = days - skippedDaysCount; // Days to charge
  const subscriptionItemsTotal = itemsTotal * effectiveDays; // subtotal after skip
  const skipAmount = itemsTotal * skippedDaysCount; // amount to subtract
  const oneTimeTotal = itemsTotal;

  const grandTotal = isSubscribed
    ? subscriptionItemsTotal + deliveryCharge
    : oneTimeTotal + deliveryCharge;

  const amountInWords = numberToWords(grandTotal);

  const address = order.addresses;
  const user = order.profiles;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; font-size: 14px; color: #111; }
    .header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #ddd; padding-bottom:12px; }
    .brand { display:flex; align-items:center; gap:12px; }
    .brand img { height:48px; }
    .brand-name { font-size:20px; font-weight:bold; }
    .section { margin-top:20px; }
    table { width:100%; border-collapse:collapse; margin-top:10px; }
    th, td { border:1px solid #ddd; padding:8px; }
    th { background:#f5f5f5; text-align:left; }
    .right { text-align:right; }
    .bold { font-weight:bold; }
    .muted { color:#666; font-size:12px; }
    .footer { margin-top:50px; display:flex; justify-content:flex-end; }
    .signature { text-align:center; }
    .signature img { height:50px; margin-bottom:6px; }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="brand">
      <img src="${BRAND_LOGO}" />
      <div class="brand-name">${BRAND_NAME}</div>
    </div>
    <div class="muted">
      <div><strong>Order ID:</strong> ${order.id}</div>
      <div><strong>Order Date:</strong> ${orderDate.toDateString()}</div>
      <div><strong>Bill Date:</strong> ${billDate.toDateString()}</div>
    </div>
  </div>

  <!-- USER DETAILS -->
  <div class="section">
    <h3>User Details</h3>
    <p>
      <strong>Name:</strong> ${user?.full_name ?? "-"}<br/>
      <strong>Phone:</strong> ${user?.phone ?? "-"}
    </p>
  </div>

  <!-- ADDRESS -->
  <div class="section">
    <h3>Delivery Address</h3>
    <p>
      ${address?.name ?? ""}<br/>
      ${address?.flat ?? ""} ${address?.floor ?? ""}<br/>
      ${address?.area ?? ""}<br/>
      ${address?.landmark ?? ""}<br/>
      Phone: ${address?.phone ?? ""}
    </p>
  </div>

  ${
    isSubscribed
      ? `
  <div class="section">
    <h3>Subscription Details</h3>
    <table>
      <tr><td>Plan</td><td class="bold">${plan}</td></tr>
      <tr><td>Duration</td><td class="bold">${days} days</td></tr>
      <tr><td>Start Date</td><td class="bold">${order.subscription!.start_date}</td></tr>
      <tr><td>Delivery Time</td><td class="bold">${order.subscription!.delivery_time ?? "-"}</td></tr>
    </table>
  </div>
  `
      : ""
  }

  <!-- ITEMS -->
  <div class="section">
    <h3>Items</h3>
    <table>
      <tr>
        <th>Product</th>
        <th>Variant</th>
        <th>Qty</th>
        <th class="right">Price</th>
        <th class="right">Total</th>
      </tr>

      ${order.order_items
        .map((item) => {
          const lineTotal = (item.variant_price ?? 0) * item.quantity;
          return `
      <tr>
        <td>${item.products?.name ?? "Unknown Product"}</td>
        <td>${item.variant_label ?? "-"}</td>
        <td>${item.quantity}</td>
        <td class="right">₹ ${item.variant_price.toFixed(2)}</td>
        <td class="right">₹ ${lineTotal.toFixed(2)}</td>
      </tr>`;
        })
        .join("")}
    </table>
  </div>

  <!-- SUMMARY -->
  <div class="section">
    <h3>Summary</h3>
    <table>
      ${
        isSubscribed
          ? `
      <tr>
        <td>Items Total (per day)</td>
        <td class="right bold">₹ ${itemsTotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Items × ${days} days</td>
        <td class="right bold">₹ ${(itemsTotal * days).toFixed(2)}</td>
      </tr>
      <tr>
        <td>Skipped Days (${skippedDaysCount})</td>
        <td class="right bold">- ₹ ${skipAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Items × ${effectiveDays} days (after skipped)</td>
        <td class="right bold">₹ ${subscriptionItemsTotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Skipped Dates</td>
        <td class="right bold">
          ${
            skippedDates?.length > 0
              ? skippedDates
                  .map((d) =>
                    new Date(d).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })
                  )
                  .join(", ")
              : "-"
          }
        </td>
      </tr>
      `
          : `
      <tr>
        <td>Items Total</td>
        <td class="right bold">₹ ${oneTimeTotal.toFixed(2)}</td>
      </tr>
      `
      }

      <tr>
        <td>Delivery Charge</td>
        <td class="right bold">₹ ${deliveryCharge.toFixed(2)}</td>
      </tr>

      <tr>
        <th>Total</th>
        <th class="right">₹ ${grandTotal.toFixed(2)}</th>
      </tr>

      <tr>
        <td colspan="2" class="bold">
          Amount in Words: ${amountInWords}
        </td>
      </tr>
    </table>
  </div>

  <!-- SIGNATURE -->
  <div class="footer">
    <div class="signature">
      <img src="${SIGNATURE_IMAGE}" />
      <div class="bold">Authorized Signatory</div>
    </div>
  </div>

</body>
</html>
`;
};
