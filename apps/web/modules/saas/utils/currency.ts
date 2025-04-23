export function formatCurrency(value: number | null | undefined, currency: string) {
  if (!value || !currency) return 'N/A';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}