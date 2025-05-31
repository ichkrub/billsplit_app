export interface Person {
  name: string;
}

export interface Item {
  name: string;
  price: number;
  assigned: string[]; // Array of person names
}

export interface SplitSummary {
  subtotal: number;
  discount: number;
  tax: number;
  service: number;
  otherCharges: number;
  total: number;
  perPerson: Record<string, number>;
}

export interface SplitInput {
  people: Person[];
  items: Item[];
  taxAmount: number;
  serviceAmount: number;
  otherCharges: number;
  discount: number;
  currency: string;
  vendorName?: string;
  billDate?: string;
}

/**
 * Calculate the total amount for a list of items
 */
export const calculateSubtotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

/**
 * Calculate per-person amounts based on item assignments
 */
export const calculatePerPersonAmounts = (
  items: Item[],
  people: Person[],
  total: number
): Record<string, number> => {
  const personShares: Record<string, number> = {};
  const personItemCounts: Record<string, number> = {};
  
  // Initialize person shares and subtotal calculation
  people.forEach(person => {
    personShares[person.name] = 0;
    personItemCounts[person.name] = 0; // Keep this for debugging
  });
  
  // Calculate shares based on item assignments
  items.forEach(item => {
    const sharePerPerson = item.price / item.assigned.length;
    item.assigned.forEach(personName => {
      personShares[personName] += sharePerPerson;
      personItemCounts[personName]++; // Keep this for debugging
    });
  });
  
  // Calculate total subtotal to find proportions
  const subtotal = calculateSubtotal(items);
  
  // Distribute tax, service, discount, and other charges proportionally
  const remainingAmount = total - subtotal;
  if (subtotal > 0) {
    Object.keys(personShares).forEach(personName => {
      const proportion = personShares[personName] / subtotal;
      personShares[personName] += remainingAmount * proportion;
    });
  }
  
  // Round to 2 decimal places
  Object.keys(personShares).forEach(personName => {
    personShares[personName] = Math.round(personShares[personName] * 100) / 100;
  });
  
  return personShares;
};

/**
 * Calculate the complete split summary
 */
export const calculateSplit = (input: SplitInput): SplitSummary => {
  const subtotal = calculateSubtotal(input.items);
  const discount = input.discount;
  const afterDiscount = subtotal - discount;
  const tax = input.taxAmount;
  const service = input.serviceAmount;
  const otherCharges = input.otherCharges || 0;
  const total = afterDiscount + tax + service + otherCharges;
  
  const perPerson = calculatePerPersonAmounts(
    input.items,
    input.people,
    total
  );
  
  return {
    subtotal,
    discount,
    tax,
    service,
    otherCharges,
    total,
    perPerson,
  };
};