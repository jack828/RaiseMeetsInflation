import { intervalToDuration } from 'date-fns'

export const currency = (value?: number, decimals: boolean = true) => {
  if (value === null || value === undefined) {
    return '-'
  }
  let formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(value)
  if (decimals) {
    return formatted
  }
  return formatted.slice(0, formatted.lastIndexOf('.'))
}

export const pct = (v?: number, showPlusMinus: boolean = true) =>
  v === null || typeof v === 'undefined'
    ? '—'
    : `${showPlusMinus ? (v === 0 ? '±' : v >= 0 ? '+' : '') : ''}${v.toFixed(2)}%`

export const timePeriod = (start: Date, end: Date) => {
  const d = intervalToDuration({
    start,
    end
  })
  let str = ''
  if (d.years) {
    str += d.years === 1 ? '1 year' : `${d.years} years`
  }
  if (d.months) {
    if (d.years) {
      str += ' '
    }
    str += d.months === 1 ? '1 month' : `${d.months} months`
  }
  return str
}
