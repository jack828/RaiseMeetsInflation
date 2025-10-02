import { v4 as uuidv4 } from 'uuid'
import { add, parse } from 'date-fns'
import { InflationDataEntry } from './datasets'
import { Selection } from '@heroui/react'

// TODO refactor out
export const monthKey = (isoMonth: string): InflationDataEntry =>
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

export interface SalaryEntry {
  id: string
  date: string // "YYYY-MM"
  datetime: Date
  amount: number
  prevPct?: number // % difference vs previous nominal
  inflationMatched?: number // what previous salary would need to be to match inflation to this date
  inflationPct?: number // % inflation over period from previous to this date
  realPct?: number // % difference of this salary vs inflation-matched amount
}

export const toSalaryEntry = (date: string, amount: number): SalaryEntry => ({
  id: uuidv4(),
  date,
  datetime: parse(date, 'yyyy-MM', new Date()),
  amount
})

export const multiplierToPct = (multiplier: number): number =>
  (multiplier - 1) * 100

export const pctDifference = (a: number, b: number) => ((a - b) / b) * 100

// what the fuck why so fucking stupid
export const getSelectionValue = (selection: Selection) => {
  if (typeof selection === 'string') {
    return selection
  }
  if (selection instanceof Set) {
    return selection.keys().toArray()[0]
  }
}
