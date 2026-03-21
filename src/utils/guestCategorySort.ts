/**
 * Priority order for guest categories.
 * Lower number = appears first in the list.
 * Family → Friends → Work → Special roles → Other
 */
const CATEGORY_PRIORITY: Record<string, number> = {
  honor_guests: 0,
  family: 1,
  groomsmen: 2,
  bridesmaids: 3,
  witnesses: 4,
  officiant: 5,
  pastor: 6,
  friends: 7,
  groomsman_friends: 8,
  bridesmaid_friends: 9,
  musicians: 10,
  work: 11,
  other: 12,
};

export function getCategoryPriority(category: string): number {
  return CATEGORY_PRIORITY[category] ?? 99;
}

/**
 * Sort guests by category priority, then alphabetically by name.
 */
export function sortGuestsByCategory<T extends { category: string; name: string }>(guests: T[]): T[] {
  return [...guests].sort((a, b) => {
    const priorityDiff = getCategoryPriority(a.category) - getCategoryPriority(b.category);
    if (priorityDiff !== 0) return priorityDiff;
    return a.name.localeCompare(b.name);
  });
}
