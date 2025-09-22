import { v4 as uuidv4 } from 'uuid'
import { add, parse } from 'date-fns'
import { InflationDataEntry, SalaryEntry } from './app/page'

// TODO refactor out
const monthKey = (isoMonth: string): InflationDataEntry =>
  isoMonth.slice(0, 7) as InflationDataEntry

// Convert annual figure to monthly multiplier
// Monthly multiplier = (1 + annual/100)^(1/12)
export const monthlyMultiplierFromAnnual = (annualPct: number) =>
  Math.pow(1 + annualPct / 100, 1 / 12)

// Compound multiplier from start to end (both inclusive) for a dataset of percentages
export const compoundMultiplier = (
  start: Date,
  end: Date,
  getValue: (key: string) => number
) => {
  if (!start || !end) return 1
  const now = new Date()
  let current = start
  let multiplier = 1
  // include start month and end month
  while (true) {
    const key = monthKey(current.toISOString())
    const value = getValue(key)

    multiplier *= monthlyMultiplierFromAnnual(value || 0)
    if (current.toISOString() === end.toISOString()) break
    current = add(current, { months: 1 })
    // safety to avoid infinite loop
    if (multiplier > 1e6 || current.getTime() > now.getTime()) break
  }
  return multiplier
}

export const toSalaryEntry = (date: string, amount: number): SalaryEntry => ({
  id: uuidv4(),
  date,
  datetime: parse(date, 'yyyy-MM', new Date()),
  amount
})

export const multiplierToPct = (multiplier: number): number =>
  (multiplier - 1) * 100
