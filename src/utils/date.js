/**
 * Date and Month utilities for Unique Castle
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function getCurrentMonth() {
  return MONTH_NAMES[new Date().getMonth()]
}

export function getCurrentYear() {
  return new Date().getFullYear()
}

export function getMonthIndex(monthName) {
  if (!monthName) return 0
  const index = MONTH_NAMES.findIndex(m => m.toLowerCase() === String(monthName).toLowerCase())
  return index >= 0 ? index : 0
}

export function getAvailableYears(range = 3) {
  const current = getCurrentYear()
  const years = []
  for (let i = current - range; i <= current + 1; i++) {
    years.push(i)
  }
  return years
}

export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
    options.hour12 = true
  }

  return date.toLocaleDateString('en-GB', options)
}

/**
 * Automatically calculates the 3 rolling calendar months:
 * Previous Month, Current Month, and Next Month relative to current date.
 */
export function getThreeRollingMonths() {
  const now = new Date()
  const curMonthIndex = now.getMonth() // 0-11
  const curYear = now.getFullYear()

  // Previous Month
  const prevDate = new Date(curYear, curMonthIndex - 1, 1)
  const prevMonthIndex = prevDate.getMonth()
  const prevMonth = MONTH_NAMES[prevMonthIndex]
  const prevYear = prevDate.getFullYear()

  // Current Month
  const currentMonth = MONTH_NAMES[curMonthIndex]
  const currentYear = curYear

  // Next Month
  const nextDate = new Date(curYear, curMonthIndex + 1, 1)
  const nextMonthIndex = nextDate.getMonth()
  const nextMonth = MONTH_NAMES[nextMonthIndex]
  const nextYear = nextDate.getFullYear()

  return [
    {
      type: 'PREVIOUS',
      label: 'Previous Month',
      monthName: prevMonth,
      monthIndex: prevMonthIndex + 1,
      year: prevYear,
      monthYearLabel: `${prevMonth} ${prevYear}`,
      monthKey: `${prevYear}-${String(prevMonthIndex + 1).padStart(2, '0')}-01`
    },
    {
      type: 'CURRENT',
      label: 'Current Month',
      monthName: currentMonth,
      monthIndex: curMonthIndex + 1,
      year: currentYear,
      monthYearLabel: `${currentMonth} ${currentYear}`,
      monthKey: `${currentYear}-${String(curMonthIndex + 1).padStart(2, '0')}-01`
    },
    {
      type: 'NEXT',
      label: 'Next Month',
      monthName: nextMonth,
      monthIndex: nextMonthIndex + 1,
      year: nextYear,
      monthYearLabel: `${nextMonth} ${nextYear}`,
      monthKey: `${nextYear}-${String(nextMonthIndex + 1).padStart(2, '0')}-01`
    }
  ]
}
