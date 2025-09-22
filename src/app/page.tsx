'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
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
  Tooltip,
  Select,
  SelectItem,
  Divider
} from '@heroui/react'
import { v4 as uuidv4 } from 'uuid'
import { intervalToDuration, parse } from 'date-fns'

import inflationData from '../data/inflation-uk.json' assert { type: 'json' }
import {
  ArrowLongRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CalendarDateRangeIcon
} from '@heroicons/react/24/outline'
/*TODO FIXME some dates missing or inaccurate.
 parsed = raw
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split(',').map((c) => c.replaceAll('"', '')))
  .slice(1)
  .map((r) => ({
    date: new Date(`01 ${r[0]}`).toISOString().slice(0, 7),
    cpih: Number(r[1]),
    cpi: Number(r[2]),
    ooh: Number(r[3])
  }))
  .reduce((acc, d) => ({ [d.date]: d, ...acc }), {}) */

interface SalaryEntry {
  id: string
  date: string // "YYYY-MM"
  datetime: Date
  amount: number
  prevPct?: number // % difference vs previous nominal
  inflationMatched?: number // what previous salary would need to be to match inflation to this date
  inflationPct?: number // % inflation over period from previous to this date
  realPct?: number // % difference of this salary vs inflation-matched amount
}

type InflationDataEntry = keyof typeof inflationData
type InflationType = 'cpih' | 'cpi' | 'ooh'
const inflationType: InflationType = 'cpih'

const monthKey = (isoMonth: string): InflationDataEntry =>
  isoMonth.slice(0, 7) as InflationDataEntry
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
    const inflationEntry = inflationData[key]
    const inflationTypeValue = inflationEntry?.[inflationType] || 0
    if (inflationTypeValue === 0) {
      console.warn('Missing inflation data for', current)
    }
    multiplier *= monthlyMultiplierFromAnnual(inflationTypeValue || 0)
    if (current === endYM) break
    current = addMonths(current, 1)
    // safety to avoid infinite loop
    if (multiplier > 1e6) break
  }
  return multiplier
}

const months = [
  { key: '01', label: 'January' },
  { key: '02', label: 'February' },
  { key: '03', label: 'March' },
  { key: '04', label: 'April' },
  { key: '05', label: 'May' },
  { key: '06', label: 'June' },
  { key: '07', label: 'July' },
  { key: '08', label: 'August' },
  { key: '09', label: 'September' },
  { key: '10', label: 'October' },
  { key: '11', label: 'November' },
  { key: '12', label: 'December' }
]

const MIN_YEAR = 2015
const years = new Array(new Date().getFullYear() - MIN_YEAR + 1)
  .fill(0)
  .map((_, i) => ({ key: `${i + MIN_YEAR}`, label: `${i + MIN_YEAR}` }))

const toSalaryEntry = (date: string, amount: number): SalaryEntry => ({
  id: uuidv4(),
  date,
  datetime: parse(date, 'yyyy-MM', new Date()),
  amount
})

export default function SalaryInflationPage() {
  const [entries, setEntries] = useState<SalaryEntry[]>([
    toSalaryEntry('2016-07', 15392),
    toSalaryEntry('2016-09', 15392),
    toSalaryEntry('2017-06', 17000),
    toSalaryEntry('2018-08', 24992.76),
    toSalaryEntry('2019-05', 27000),
    toSalaryEntry('2019-06', 29000),
    toSalaryEntry('2021-04', 34000),
    toSalaryEntry('2022-01', 40000),
    toSalaryEntry('2022-06', 50000),
    toSalaryEntry('2023-08', 75000),
    toSalaryEntry('2024-01', 78187.5),
    toSalaryEntry('2025-02', 83000)
  ])
  const [inputMonth, setInputMonth] = useState('')
  const [inputYear, setInputYear] = useState('')
  const [amount, setAmount] = useState('')

  // derive table rows with comparisons vs previous
  const rows = useMemo(() => {
    return entries.map((entry, i, arr) => {
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
    if (!inputMonth || !inputYear || !amount) return
    const amt = Number(amount.replace(/[,£\s]/g, ''))
    if (Number.isNaN(amt) || amt <= 0) return
    const date = `${inputYear}-${inputMonth}`
    setEntries((s) =>
      [...s, toSalaryEntry(date, amt)].sort(
        (a, b) => a.datetime.getTime() - b.datetime.getTime()
      )
    )
    setInputMonth('')
    setInputYear('')
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

  // TODO useMemo and optimise
  // TODO explainer
  let overallNominalChange = 0
  if (entries.length >= 2) {
    const first = entries[0].amount
    const last = entries[entries.length - 1].amount
    const pct = ((last - first) / first) * 100
    overallNominalChange = pct
  }

  // TODO red/green
  // TODO is this correct
  let overallRealVsInflation = 0
  let overallInflation = '-'
  let exampleInflationValue = '1.00'
  if (entries.length >= 2) {
    // compute cumulative inflation from first.date to last.date
    const inflation = compoundInflation(
      entries[0].date,
      entries[entries.length - 1].date
    )
    const inflationMatched = entries[0].amount * inflation
    const last = entries[entries.length - 1].amount
    const realPct = ((last - inflationMatched) / inflationMatched) * 100
    overallRealVsInflation = realPct

    overallInflation = formatPct((inflation - 1) * 100)
    exampleInflationValue = (1 * inflation).toFixed(2)
  }

  const timePeriod = useMemo(() => {
    if (entries.length < 2) {
      return '-'
    }
    const d = intervalToDuration({
      start: entries[0].datetime,
      end: entries[entries.length - 1].datetime
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
  }, [entries])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="shadow">
          <CardHeader className="flex-col">
            <h1 className="text-2xl font-semibold">TODO</h1>
          </CardHeader>

          <CardBody>
            <ul className="list-disc list-inside ">
              {[
                '"if you got a raise today" list item for what you should be getting, compare to the ons widget',
                'check the maths',
                'Input salary or hourly wage + hours/week',
                'salary £ misaligned',
                'transition summary to visible when adding entries - "add 2 or more entries to see more information"',
                'inflation metric selector',
                'smart quotes',
                'ko-fi',
                'ads'
              ].map((item, i) => (
                <li key={`${i}`}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Spacer y={1} />

        <Card className="shadow-lg">
          <CardHeader className="flex-col">
            <h1 className="text-2xl font-semibold">Salary vs Inflation</h1>
          </CardHeader>

          <CardBody>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
                <Select
                  className="max-w-xs"
                  label="Month"
                  placeholder="-- Select Month --"
                  value={inputMonth}
                  onChange={(e) => setInputMonth(e.target.value)}
                >
                  {months.map((month) => (
                    <SelectItem key={month.key}>{month.label}</SelectItem>
                  ))}
                </Select>
                <Select
                  className="max-w-xs"
                  label="Year"
                  placeholder="-- Select Year --"
                  value={inputYear}
                  onChange={(e) => setInputYear(e.target.value)}
                >
                  {years.map((years) => (
                    <SelectItem key={years.key}>{years.label}</SelectItem>
                  ))}
                </Select>
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
                  isDisabled={!inputMonth || !inputYear || !amount}
                >
                  Add Entry
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Spacer y={1} />

        <Card className="shadow">
          <CardHeader>
            <h2 className="text-lg font-medium">Summary</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-default-100 rounded">
                  <div className="text-md text-default-700">
                    Based on your chosen inflation metric, over {timePeriod}{' '}
                    inflation has risen by {overallInflation}. This means that
                    £1 then has the same purchasing power as £
                    {exampleInflationValue} today.
                  </div>
                </div>
                <div className="p-4 bg-default-100 rounded flex items-center">
                  <div className="flex-1">
                    <div className="text-sm text-default-600">Time period</div>
                    <div className="text-xl font-bold">{timePeriod}</div>
                  </div>
                  <div className="ml-3 w-6 flex items-center justify-center">
                    <CalendarDateRangeIcon />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-default-100 rounded">
                  <div className="text-md text-default-700">
                    This is the amount that your salary has increased, ignoring
                    inflation, over the all the entries you've provided.
                  </div>
                </div>
                <div className="p-4 bg-default-100 rounded flex items-center">
                  <div className="flex-1">
                    <div className="text-sm text-default-600">
                      Overall Nominal Change
                    </div>
                    <div className="text-xl font-bold">
                      {formatPct(overallNominalChange)}
                    </div>
                  </div>
                  <div className="ml-3 w-6 flex items-center justify-center">
                    {overallNominalChange === 0 ? (
                      <ArrowLongRightIcon />
                    ) : overallNominalChange > 0 ? (
                      <ArrowTrendingUpIcon className="text-success-700 dark:text-success" />
                    ) : (
                      <ArrowTrendingDownIcon className="text-danger-600 dark:text-danger-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-default-100 rounded">
                  <div className="text-md text-default-700">
                    Factoring in inflation to your salary history, this is how
                    much it has changed in terms of real spending power.
                  </div>
                </div>
                <div className="p-4 bg-default-100 rounded flex items-center">
                  <div className="flex-1">
                    <div className="text-sm text-default-600">
                      Overall Adjusted Change
                    </div>
                    <div className="text-xl font-bold">
                      {formatPct(overallRealVsInflation)}
                    </div>
                  </div>
                  <div className="ml-3 w-6 flex items-center justify-center">
                    {overallRealVsInflation === 0 ? (
                      <ArrowLongRightIcon />
                    ) : overallRealVsInflation > 0 ? (
                      <ArrowTrendingUpIcon className="text-success-700 dark:text-success" />
                    ) : (
                      <ArrowTrendingDownIcon className="text-danger-600 dark:text-danger-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-default-100 rounded">
                  <div className="text-md text-default-700">
                    The cumulative average increase in pay over the UK,
                    pro-rated to the time period you’ve provided.
                    <br />
                    Generally, this is how much everyone else's salary has
                    increased over the same time.
                  </div>
                </div>
                <div className="p-4 bg-default-100 rounded flex items-center">
                  <div className="flex-1">
                    <div className="text-sm text-default-600">
                      Average Pay Rise Over Period
                    </div>
                    <div className="text-xl font-bold">+420.69%</div>
                  </div>
                  <div className="ml-3 w-6 flex items-center justify-center">
                    {overallRealVsInflation === 0 ? (
                      <ArrowLongRightIcon />
                    ) : overallRealVsInflation > 0 ? (
                      <ArrowTrendingUpIcon className="text-success-700 dark:text-success" />
                    ) : (
                      <ArrowTrendingDownIcon className="text-danger-600 dark:text-danger-500" />
                    )}
                  </div>
                </div>
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
                    Inflation‑matched Salary 🛈
                  </Tooltip>
                </TableColumn>
                <TableColumn>
                  <Tooltip
                    content={
                      <div className="px-1 py-2">
                        <div className="text-small">
                          How your new salary compares to the inflation-matched
                          value.
                          <br />
                          This is the "real" spending power change in your
                          salary.
                          <br /> Negative values are a <strong>PAY CUT</strong>.
                        </div>
                      </div>
                    }
                    showArrow={true}
                  >
                    Salary vs Inflation 🛈
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

        <Spacer y={1} />

        <Card className="shadow">
          <CardHeader>
            <h1 className="text-2xl font-semibold">DISCLAIMER</h1>
          </CardHeader>

          <CardBody className="space-y-2">
            <p className="text-sm text-default-600">
              This tool provides illustrative, approximate comparisons between
              your nominal salary changes and UK inflation. Results are
              indicative only.
            </p>

            <ul className="list-disc ml-5 text-sm text-default-600">
              <li>
                Variation: Calculations use monthly CPIH/CPI/OOH year‑on‑year
                rates converted to monthly multipliers and compounded between
                the selected months - different methods (e.g. interpolating
                daily rates, or using alternative indexing) will produce
                different results.
              </li>
              <li>
                Data sources: CPIH/CPI/OOH monthly rates should be obtained from
                the UK Office for National Statistics (ONS).
                <div className="mt-1 space-y-1">
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/consumerpriceinflation/latest"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ONS - Consumer price inflation (CPIH & CPI & OOH) bulletin
                  </a>
                  <br />
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/methodology/classificationsandstandards/measuringinflation"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ONS - Measuring inflation (methodology)
                  </a>
                </div>
              </li>
              <li>
                Anonymity & handling: None of your salary information leaves
                your browser. If you choose to screenshot or download a copy of
                the page, then it only exists with you.
              </li>
              <li>
                This is not financial, tax, or employment advice. For important
                decisions, consult a qualified professional.
              </li>
            </ul>

            <p className="text-sm text-default-600">
              Average pay rise figures are from TODO SOURCE and vary wildly
              depending on your industry and specific job role.
            </p>

            <p className="text-sm text-default-600">
              Data last updated on TODO DATE
            </p>
          </CardBody>
        </Card>

        <Divider />
        <p className="text-sm text-default-500 text-center">
          <a href="https://jackburgess.dev">Jack Burgess</a> &copy;{' '}
          {new Date().getFullYear()}
          <br />
          Powered my tea, marmalade, and curiosity.
          <br />
          <span className="font-mono">&lt;/website&gt;</span>
        </p>
      </div>
    </div>
  )
}
