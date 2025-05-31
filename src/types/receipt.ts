export interface ParsedReceipt {
  vendor_name: string;
  date: string;
  currency: string;
  items: Array<{
    name: string;  // May include discount info like "(-15% discount applied)"
    price: number; // Price after any item-specific discounts
  }>;
  subtotal: number;
  tax: number;
  service_charge: number;
  other_charge: number;
  general_discount: number; // Discounts not tied to specific items
  total: number;
}
