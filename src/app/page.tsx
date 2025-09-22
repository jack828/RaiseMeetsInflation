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
  Divider,
  CardFooter
} from '@heroui/react'

import {
  ArrowDownIcon,
  CalendarDateRangeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

import { compoundMultiplier, multiplierToPct, toSalaryEntry } from '@/lib'
import * as formatters from '@/formatters'
import * as datasets from '@/datasets'
import { NextRaiseCard } from '@/components/next-raise-card'
import { trendIcon } from '@/components/trend-icon'

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

export type InflationType = 'cpih' | 'cpi'
const inflationType: InflationType = 'cpih'

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
      const inflationMultiplier = compoundMultiplier(
        prev.datetime,
        entry.datetime,
        datasets.getInflationValue(inflationType)
      )
      const inflationMatched = +(prev.amount * inflationMultiplier).toFixed(2)
      const inflationPct = multiplierToPct(inflationMultiplier)

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

  const overallNominalChange = useMemo(() => {
    if (entries.length < 2) {
      return 0
    }

    const first = entries[0].amount
    const last = entries[entries.length - 1].amount
    const pct = ((last - first) / first) * 100
    return pct
  }, [entries])

  const [overallAdjustedChange, overallInflation, exampleInflationValue] =
    useMemo(() => {
      if (entries.length < 2) {
        return [0, 0, '1.00']
      }

      const inflationMultiplier = compoundMultiplier(
        entries[0].datetime,
        entries[entries.length - 1].datetime,
        datasets.getInflationValue(inflationType)
      )
      const inflationMatched = entries[0].amount * inflationMultiplier
      const last = entries[entries.length - 1].amount
      const realPct = ((last - inflationMatched) / inflationMatched) * 100

      return [
        realPct,
        multiplierToPct(inflationMultiplier),
        (1 * inflationMultiplier).toFixed(2)
      ]
    }, [entries])

  const timePeriod = useMemo(() => {
    if (entries.length < 2) {
      return '-'
    }
    return formatters.timePeriod(
      entries[0].datetime,
      entries[entries.length - 1].datetime
    )
  }, [entries])

  const averagePayRiseOverPeriod = useMemo(() => {
    if (entries.length < 2) {
      return 0
    }

    const payGrowthMultiplier = compoundMultiplier(
      entries[0].datetime,
      entries[entries.length - 1].datetime,
      datasets.getPayGrowthValue
    )
    return multiplierToPct(payGrowthMultiplier)
  }, [entries])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card className="shadow">
          <CardHeader>
            <h1 className="text-2xl font-semibold">TODO</h1>
          </CardHeader>

          <CardBody>
            <ul className="list-disc list-inside">
              {[
                'Input salary or hourly wage + hours/week',
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

        <Divider />

        <Card className="shadow">
          <CardHeader>
            <h1 className="text-2xl font-semibold">How to use</h1>
          </CardHeader>

          <CardBody>
            Looking for a pay rise? Not sure what you should argue for? This is
            what RaiseMeetsInflation is designed for. Put in your salary history
            and you'll see how it compares to inflation.
            <br />
            Why should you care about inflation?
            <br />
            Because if your employer is giving you _less_ than inflation, it
            means the spending power of your pay is going down. In "real" terms,
            that means you're getting a **pay cut**, for doing the exact same
            thing.
            <br />
            This site is about finding that longer term trend to better argue
            with your employer. Has it been long awaited for you to get a boost?
            Or, are you just curious just how well you've performed by switching
            jobs?
          </CardBody>
        </Card>

        <Spacer y={1} />

        <Card className="shadow-lg">
          <CardHeader>
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
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">£</span>
                    </div>
                  }
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
                    inflation has risen by {formatters.pct(overallInflation)}.
                    This means that £1 then has the same purchasing power as £
                    {exampleInflationValue} today.
                  </div>
                </div>
                <div className="p-4 bg-default-100 rounded flex items-center">
                  <div className="flex-1">
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
                      {formatters.pct(overallNominalChange)}
                    </div>
                  </div>
                  <div className="ml-3 w-6 flex items-center justify-center">
                    {trendIcon(overallNominalChange)}
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
                      {formatters.pct(overallAdjustedChange)}
                    </div>
                  </div>
                  <div className="ml-3 w-6 flex items-center justify-center">
                    {trendIcon(overallAdjustedChange)}
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
                    <div className="text-xl font-bold">
                      {formatters.pct(averagePayRiseOverPeriod)}
                    </div>
                    <div className="text-sm text-default-500">
                      {formatters.pct(
                        averagePayRiseOverPeriod - overallInflation
                      )}{' '}
                      inflation adjusted
                    </div>
                  </div>
                  <div className="ml-3 w-6 flex items-center justify-center">
                    {trendIcon(averagePayRiseOverPeriod)}
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="flex flex-col justify-center space-y-2">
              <p>
                Want to see how much you should ask for next? Scroll down and
                see.
              </p>
              <ArrowDownIcon className="size-6 animate-bounce" />
            </CardFooter>
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
                    Difference vs Inflation 🛈
                  </Tooltip>
                </TableColumn>
                <TableColumn hideHeader>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="Nothing to see here. Put your current salary and the date you got it into the box above.">
                {rows.map((r, idx) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="font-semibold">
                      {formatters.currency(r.amount)}
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? '—' : formatters.pct(r.prevPct)}
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? '—' : `${r.inflationPct?.toFixed(2)}%`}
                    </TableCell>
                    <TableCell>
                      {idx === 0
                        ? '—'
                        : formatters.currency(r.inflationMatched)}
                    </TableCell>
                    <TableCell>
                      {idx === 0 ? (
                        '—'
                      ) : (
                        <Chip
                          color={
                            (r.realPct ?? 0) === 0
                              ? 'default'
                              : (r.realPct ?? 0) >= 0
                                ? 'success'
                                : 'danger'
                          }
                          variant="flat"
                          size="sm"
                        >
                          {formatters.pct(r.realPct)}
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
                        <TrashIcon className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>

        <Spacer y={1} />

        <NextRaiseCard entries={entries} inflationType={inflationType} />

        <Spacer y={1} />

        <Card className="shadow">
          <CardHeader>
            <h2 className="text-lg font-medium">Visualization</h2>
          </CardHeader>
          <CardBody>
            <div className="h-64 bg-default-100 rounded-lg flex items-center justify-center">
              <p className="text-default-400">Chart placeholder</p>
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
                Calculations use monthly CPIH/CPI annual rates converted to
                monthly multipliers and compounded between the selected months -
                different methods (e.g. interpolating daily rates, or using
                alternative indexing) will produce different results.
              </li>
              <li>
                Inflation data sourced from the UK Office for National
                Statistics (ONS):
                <div className="mt-1 space-y-1">
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/l55o/mm23"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ONS - CPIH ANNUAL RATE 00: ALL ITEMS 2015=100
                  </a>
                  <br />
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ONS - CPI ANNUAL RATE 00: ALL ITEMS 2015=100
                  </a>
                </div>
              </li>

              <li>
                Pay growth data sourced from the UK Office for National
                Statistics (ONS):
                <div className="mt-1 space-y-1">
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/realtimeinformationstatisticsreferencetablenonseasonallyadjusted"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Earnings and employment from Pay As You Earn Real Time
                    Information, non-seasonally adjusted [27. Median of Pay
                    Growth (UK)]
                  </a>
                  <br />
                  <strong>
                    Pay growth varies wildly depending on industry and your
                    specific job role.
                  </strong>
                </div>
              </li>

              <li>
                None of your salary information leaves your browser. If you
                choose to screenshot or download a copy of the page, then it
                only exists with you.
              </li>
              <li>
                This is not financial, tax, or employment advice. For important
                decisions, consult a qualified professional.
              </li>
            </ul>

            <p className="text-sm text-default-600">
              Data last updated on TODO DATE. Some figures take time to release
              and therefore may be out of date until the data sources used
              publish new versions.
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
