'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spacer,
  Tooltip
} from '@heroui/react'
import { v4 as uuidv4 } from 'uuid'

interface SalaryEntry {
  id: string
  date: string // "YYYY-MM"
  amount: number
  prevPct?: number // % difference vs previous nominal
  inflationMatched?: number // what previous salary would need to be to match inflation to this date
  inflationPct?: number // % inflation over period from previous to this date
  realPct?: number // % difference of this salary vs inflation-matched amount
}

// CPIH sample: year-on-year annual rates (%) for each month (keys "YYYY-MM")
// (Replace with real CPIH series)
const cpihData: Record<string, number> = {
  '2023-08': 3.788,
  '2023-09': 3.829,
  '2023-10': 4.6,
  '2023-11': 3.941,
  '2023-12': 3.993,
  '2024-01': 3.981,
  '2024-02': 3.411,
  '2024-03': 3.228,
  '2024-04': 2.333,
  '2024-05': 1.99,
  '2024-06': 1.975,
  '2024-07': 2.234,
  '2024-08': 2.216,
  '2024-09': 1.68,
  '2024-10': 2.281,
  '2024-11': 2.622,
  '2024-12': 2.503,
  '2025-01': 2.983,
  '2025-02': 2.836
}

// helpers
const monthKey = (isoMonth: string) => isoMonth.slice(0, 7) // ensure "YYYY-MM"
const addMonths = (ym: string, n = 1) => {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear().toString().padStart(4, '0')}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`
}

// Convert annual CPIH % (year-on-year) to monthly multiplier for that month.
// If cpih is the annual rate (e.g. 3.0), monthly multiplier = (1 + cpih/100)^(1/12)
const monthlyMultiplierFromAnnual = (annualPct: number) =>
  Math.pow(1 + annualPct / 100, 1 / 12)

// Compound inflation multiplier from start (inclusive) to end (inclusive previous month).
// Example: start "2023-08" -> end "2024-01" will compound months Aug2023..Jan2024 inclusive.
const compoundInflation = (startYM: string, endYM: string) => {
  if (!startYM || !endYM) return 1
  let current = startYM
  let multiplier = 1
  // include start month and end month
  while (true) {
    const key = monthKey(current)
    const annual = cpihData[key] ?? 0
    multiplier *= monthlyMultiplierFromAnnual(annual)
    if (current === endYM) break
    current = addMonths(current, 1)
    // safety to avoid infinite loop
    if (multiplier > 1e6) break
  }
  return multiplier
}

export default function SalaryInflationPage() {
  const [entries, setEntries] = useState<SalaryEntry[]>([
    { id: uuidv4(), date: '2016-09', amount: 15392 },
    { id: uuidv4(), date: '2017-06', amount: 17000 },
    { id: uuidv4(), date: '2018-08', amount: 24992.76 },
    { id: uuidv4(), date: '2019-05', amount: 27000 },
    { id: uuidv4(), date: '2019-06', amount: 29000 },
    { id: uuidv4(), date: '2021-04', amount: 34000 },
    { id: uuidv4(), date: '2022-01', amount: 40000 },
    { id: uuidv4(), date: '2022-06', amount: 50000 },
    { id: uuidv4(), date: '2023-08', amount: 75000 },
    { id: uuidv4(), date: '2024-01', amount: 78187.5 },
    { id: uuidv4(), date: '2025-02', amount: 83000 }
  ])
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')

  // derive table rows with comparisons vs previous
  const rows = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.map((entry, i, arr) => {
      if (i === 0) return { ...entry } as SalaryEntry
      const prev = arr[i - 1]
      // nominal % change vs previous
      const prevPct = ((entry.amount - prev.amount) / prev.amount) * 100

      // compound inflation from prev.date to entry.date
      const inflationMultiplier = compoundInflation(prev.date, entry.date)
      const inflationMatched = +(prev.amount * inflationMultiplier).toFixed(2)
      const inflationPct = (inflationMultiplier - 1) * 100

      // real % difference of actual new salary vs inflation-matched value
      const realPct =
        ((entry.amount - inflationMatched) / inflationMatched) * 100

      return {
        ...entry,
        prevPct,
        inflationMatched,
        inflationPct,
        realPct
      } as SalaryEntry
    })
  }, [entries])

  const addEntry = () => {
    if (!date || !amount) return
    const amt = Number(amount.replace(/[,£\s]/g, ''))
    if (Number.isNaN(amt) || amt <= 0) return
    setEntries((s) =>
      [...s, { id: uuidv4(), date: monthKey(date), amount: amt }].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    )
    setDate('')
    setAmount('')
  }

  const removeEntry = (id: string) =>
    setEntries((s) => s.filter((r) => r.id !== id))

  const formatCurrency = (v?: number) =>
    v == null
      ? '—'
      : new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP'
        }).format(v)

  const formatPct = (v?: number) =>
    v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="flex-col">
            <h1 className="text-2xl font-semibold">Salary vs CPIH</h1>
            <p className="text-sm text-default-600">
              Enter month and salary; compares nominal change to inflation.
            </p>
          </CardHeader>

          <CardBody>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Input
                  type="month"
                  label="Month & Year"
                  placeholder="YYYY-MM"
                  value={date}
                  onChange={(e: any) => setDate(e.target.value)}
                  variant="bordered"
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Salary"
                  placeholder="9001"
                  value={amount}
                  onChange={(e: any) => setAmount(e.target.value)}
                  startContent={<span className="text-default-400">£</span>}
                  variant="bordered"
                />
              </div>
              <div className="md:col-span-2">
                <Button
                  color="primary"
                  onPress={addEntry}
                  className="w-full"
                  isDisabled={!date || !amount}
                >
                  Add Entry
                </Button>
              </div>
            </div>
          </CardBody>

          <CardFooter>
            <small className="text-default-500">
              CPIH monthly series used to compound inflation between entries.
            </small>
          </CardFooter>
        </Card>

        <Spacer y={1} />

        <Card className="shadow">
          <CardHeader>
            <h2 className="text-lg font-medium">Summary</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-default-100 rounded">
                <div className="text-sm text-default-600">Entries</div>
                <div className="text-xl font-bold">{entries.length}</div>
              </div>
              <div className="p-4 bg-default-100 rounded">
                <div className="text-sm text-default-600">
                  Overall Nominal Change
                </div>
                {entries.length >= 2 ? (
                  (() => {
                    const sorted = [...entries].sort((a, b) =>
                      a.date.localeCompare(b.date)
                    )
                    const first = sorted[0].amount
                    const last = sorted[sorted.length - 1].amount
                    const pct = ((last - first) / first) * 100
                    return (
                      <div className="text-xl font-bold">{pct.toFixed(2)}%</div>
                    )
                  })()
                ) : (
                  <div className="text-xl font-bold">—</div>
                )}
              </div>
              <div className="p-4 bg-default-100 rounded">
                <div className="text-sm text-default-600">
                  Overall Real vs Inflation
                </div>
                {entries.length >= 2 ? (
                  (() => {
                    const sorted = [...entries].sort((a, b) =>
                      a.date.localeCompare(b.date)
                    )
                    // compute cumulative inflation from first.date to last.date
                    const mult = compoundInflation(
                      sorted[0].date,
                      sorted[sorted.length - 1].date
                    )
                    const inflationMatched = sorted[0].amount * mult
                    const last = sorted[sorted.length - 1].amount
                    const realPct =
                      ((last - inflationMatched) / inflationMatched) * 100
                    return (
                      <div className="text-xl font-bold">
                        {realPct >= 0 ? '+' : ''}
                        {realPct.toFixed(2)}%
                      </div>
                    )
                  })()
                ) : (
                  <div className="text-xl font-bold">—</div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <Spacer y={1} />

        <Card className="shadow">
          <CardHeader>
            <h2 className="text-lg font-medium">Salary History</h2>
          </CardHeader>
          <CardBody className="font-mono">
            <Table aria-label="Salary history table" removeWrapper>
              <TableHeader>
                <TableColumn>Date</TableColumn>
                <TableColumn>Salary</TableColumn>
                <TableColumn>Pay Difference</TableColumn>
                <TableColumn>Inflation over period</TableColumn>
                <TableColumn>
                  <Tooltip
                    content={
                      <div className="px-1 py-2">
                        <div className="text-small">
                          What you would have gotten if your employer ONLY
                          matched to inflation. <br />
                          That is, no real loss of spending power in your wage.
                        </div>
                      </div>
                    }
                    showArrow={true}
                  >
                    Inflation‑matched Salary (?)
                  </Tooltip>
                </TableColumn>
                <TableColumn>
                  <Tooltip
                    content={
                      <div className="px-1 py-2">
                        <div className="text-small">
                          How your new salary compares to the inflation-matched
                          value.
                          <br /> Negative values are a <strong>PAY CUT</strong>.
                        </div>
                      </div>
                    }
                    showArrow={true}
                  >
                    Salary vs Inflation (?)
                  </Tooltip>
                </TableColumn>
                <TableColumn hideHeader>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Nothing to see here. Put your current salary and the date you got it into the box above.">
                {rows.map((r, idx) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(r.amount)}
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? '—' : formatPct(r.prevPct)}
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? '—' : `${r.inflationPct?.toFixed(2)}%`}
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? '—' : formatCurrency(r.inflationMatched)}
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? (
                        '—'
                      ) : (
                        <Chip
                          color={(r.realPct ?? 0) >= 0 ? 'success' : 'danger'}
                          variant="flat"
                          size="sm"
                        >
                          {formatPct(r.realPct)}
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        size="sm"
                        onPress={() => removeEntry(r.id)}
                      >
                        ✕
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Spacer y={1} />

        <Card className="shadow">
          <CardHeader>
            <h2 className="text-lg font-medium">Visualization</h2>
          </CardHeader>
          <CardBody>
            <div className="h-64 bg-default-100 rounded-lg flex items-center justify-center">
              <p className="text-default-400">
                Chart placeholder — plug in chart library and feed (date,
                actual, inflationMatched)
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
