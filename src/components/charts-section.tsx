'use client'
import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardBody, Switch } from '@heroui/react'

import dynamic from 'next/dynamic'
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

import {
  compoundMultiplier,
  SalaryEntry
} from '@/lib'
import * as formatters from '@/formatters'
import * as datasets from '@/datasets'
import { add, format } from 'date-fns'
import { useTheme } from 'next-themes'

interface ChartsSectionProps {
  entries: SalaryEntry[]
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ entries }) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isAdjusted, setIsAdjusted] = useState(false)
  const salarySeries = useMemo(() => {
    const now = new Date()

    const adjustIfAdjusted = (entry: SalaryEntry) => {
      if (!isAdjusted) {
        return entry
      }

      const inflationMultiplier = compoundMultiplier(
        entry.datetime,
        now,
        datasets.getInflationValue
      )
      const adjustedAmount = +(entry.amount * inflationMultiplier).toFixed(2)
      return Object.assign({}, entry, { amount: adjustedAmount })
    }
    const series = entries.map((entry) => {
      const e = adjustIfAdjusted(entry)
      return { x: entry.datetime.toISOString(), y: e.amount, entry: e }
    })
    return series
  }, [entries, isAdjusted])

  const inflationSeries = useMemo(() => {
    let start = entries[0]?.datetime || new Date('2015-01-01')
    const end = new Date()

    let inflationEntries = []

    let current = start
    while (current.getTime() < end.getTime()) {
      const value = datasets.getInflationValue(format(current, 'yyyy-MM'))
      inflationEntries.push({ x: format(current, 'yyyy-MM'), y: value })
      current = add(current, { months: 1 })
    }
    if (inflationEntries[inflationEntries.length - 1]?.y === 0) {
      inflationEntries.pop()
    }
    return inflationEntries
  }, [entries])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className="shadow p-4">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Visualisations</h2>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-default-600">
            Loading, please wait...
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="shadow p-4">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Visualisations</h2>
      </CardHeader>
      <CardBody className="space-y-2">
        <p>
          This graph is more interesting if you add more of your salary history.
          How far back can you remember?
        </p>
        <div className="flex flex-row">
          Adjust your salary for inflation as of {format(new Date(), 'yyyy-MM')}
          <Switch
            className="ml-2"
            isSelected={isAdjusted}
            onValueChange={(isSelected) => setIsAdjusted(isSelected)}
          />
        </div>
        <Chart
          type="line"
          options={{
            chart: {
              id: 'chart-id-here',
              background: 'none',
              toolbar: {
                export: {
                  png: {
                    filename: 'RaiseMeetsInflation Salary History'
                  },
                  csv: {
                    // disabled, hidden in css
                  },
                  svg: {
                    // disabled, hidden in css
                  }
                }
              }
            },
            theme: {
              mode: resolvedTheme === 'dark' ? 'dark' : 'light'
            },
            xaxis: {
              type: 'datetime',
              labels: {
                formatter: function (value, timestamp, opts) {
                  if (!timestamp) return value

                  return opts.dateFormatter(
                    // fucking timezones
                    add(new Date(timestamp), { days: 10 }),
                    'yyyy-MM'
                  )
                },
                style: {
                  cssClass: 'fill-black dark:fill-white'
                }
              }
            },
            yaxis: [
              {
                min: 0,
                labels: {
                  formatter(val, opts) {
                    return formatters.currency(val, false)
                  },
                  style: {
                    cssClass: 'fill-black dark:fill-white'
                  }
                }
              },
              {
                min: 0, // TODO handle negative inflation at some point
                opposite: true,
                labels: {
                  style: {
                    cssClass: 'fill-black dark:fill-white'
                  }
                }
              }
            ],
            tooltip: {
              y: [
                {
                  formatter(val, opts) {
                    return formatters.currency(val, true)
                  }
                },
                {
                  formatter(val, opts) {
                    return val.toFixed(2) + '%'
                  }
                }
              ]
            }
          }}
          series={[
            {
              name: 'Your Salary',
              data: salarySeries
            },
            { name: 'Monthly Inflation', data: inflationSeries }
          ]}
        />
      </CardBody>
    </Card>
  )
}
