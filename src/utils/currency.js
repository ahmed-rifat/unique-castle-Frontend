/**
 * Currency formatting utility for Bangladeshi Taka (BDT)
 * Ensures standard format: ৳ 1,500.00
 */
export function formatCurrency(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return showSymbol ? '৳ 0.00' : '0.00'
  }
  const num = Number(amount)
  const formatted = num.toLocaleString('en-BD', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return showSymbol ? `৳ ${formatted}` : formatted
}

