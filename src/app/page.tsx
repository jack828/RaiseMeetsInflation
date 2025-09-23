'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
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
  Divider,
  CardFooter
} from '@heroui/react'

import {
  ArrowDownIcon,
  CalendarDateRangeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

import {
  compoundMultiplier,
  multiplierToPct,
  SalaryEntry,
  toSalaryEntry
} from '@/lib'
import * as formatters from '@/formatters'
import * as datasets from '@/datasets'
import { NextRaiseSection } from '@/components/next-raise-section'
import { trendIcon } from '@/components/trend-icon'
import { SalaryInputCard } from '@/components/salary-input-card'
import {
  SummaryCard,
  SummaryCardGrid,
  SummaryCardLeft,
  SummaryCardRight
} from '@/components/summary-card-grid'
import { SummarySection } from '@/components/summary-section'

export type InflationType = 'cpih' | 'cpi'
const inflationType: InflationType = 'cpih'

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

  const onAddSalary = (entry: SalaryEntry) => {
    setEntries((s) =>
      s
        .concat(entry)
        .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
    )
  }

  const removeEntry = (id: string) =>
    setEntries((s) => s.filter((r) => r.id !== id))

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
                'transition summary to visible when adding entries - "add 2 or more entries to see more information"',
                'mobile layout',
                'graph',
                'smart quotes',
                'ko-fi',
                'ads',
                'inflation metric selector'
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
            and you’ll see how it compares to inflation.
            <br />
            Why should you care about inflation?
            <br />
            Because if your employer is giving you _less_ than inflation, it
            means the spending power of your pay is going down. In “real” terms,
            that means you’re getting a **pay cut**, for doing the exact same
            thing.
            <br />
            This site is about finding that longer term trend to better argue
            with your employer. Has it been long awaited for you to get a boost?
            Or, are you just curious just how well you’ve performed by switching
            jobs?
          </CardBody>
        </Card>

        <Spacer y={1} />

        <SalaryInputCard handleAddSalary={onAddSalary} />

        <Spacer y={1} />

        <SummarySection entries={entries} inflationType={inflationType} />

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
                          This is the “real” spending power change in your
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

        <NextRaiseSection entries={entries} inflationType={inflationType} />

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
