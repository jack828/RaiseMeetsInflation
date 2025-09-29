import { useMemo } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/react'
import {
  ArrowDownIcon,
  CalendarDateRangeIcon
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

import {
  compoundMultiplier,
  multiplierToPct,
  pctDifference,
  SalaryEntry
} from '@/lib'
import * as formatters from '@/formatters'
import * as datasets from '@/datasets'
import { InflationType } from '@/app/page'
import { trendIcon } from '@/components/trend-icon'
import {
  SummaryCard,
  SummaryCardGrid,
  SummaryCardLeft,
  SummaryCardRight
} from '@/components/summary-card-grid'

interface SummarySectionProps {
  entries: SalaryEntry[]
  inflationType: InflationType
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  entries,
  inflationType
}) => {
  const data = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        showSummary: false,
        timePeriod: '6 years 9 months',
        averagePayRiseOverPeriod: 12.69,
        overallAdjustedChange: 10.02,
        overallInflation: 10.8,
        exampleInflationValue: 1.11,
        overallNominalChange: 22.5,
        overallNominalChangeAmount: 420.69
      }
    }
    const showSummary = entries.length >= 2
    const first = entries[0]
    const last = showSummary
      ? entries[entries.length - 1]
      : { datetime: new Date(), amount: first.amount }

    const timePeriod = formatters.timePeriod(first.datetime, last.datetime)
    const payGrowthMultiplier = compoundMultiplier(
      first.datetime,
      last.datetime,
      datasets.getPayGrowthValue
    )
    const averagePayRiseOverPeriod = multiplierToPct(payGrowthMultiplier)
    // I don't like it but it makes the placeholders look reasonable!
    if (!showSummary) {
      last.amount *= payGrowthMultiplier
    }

    const inflationMultiplier = compoundMultiplier(
      first.datetime,
      last.datetime,
      datasets.getInflationValue(inflationType)
    )
    const inflationMatched = first.amount * inflationMultiplier
    const realPct = pctDifference(last.amount, inflationMatched)

    const overallAdjustedChange = realPct
    const overallInflation = multiplierToPct(inflationMultiplier)
    const exampleInflationValue = (1 * inflationMultiplier).toFixed(2)

    const overallNominalChange = pctDifference(last.amount, first.amount)
    const overallNominalChangeAmount = last.amount - first.amount

    return {
      showSummary,
      timePeriod,
      averagePayRiseOverPeriod,
      overallAdjustedChange,
      overallInflation,
      exampleInflationValue,
      overallNominalChange,
      overallNominalChangeAmount
    }
  }, [entries, inflationType])

  // TODO in blur state, make the arrows wiggle between green-up/red-down
  return (
    <Card className="shadow p-4">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Summary</h2>
      </CardHeader>
      <CardBody>
        <div className="relative">
          <SummaryCardGrid>
            <SummaryCard
              className={clsx('transition-all', entries.length > 0 && 'z-30')}
            >
              <SummaryCardLeft>
                <div className="text-md text-default-700">
                  Based on your chosen inflation metric, over{' '}
                  <strong>{data.timePeriod}</strong> inflation has risen by{' '}
                  <strong>{formatters.pct(data.overallInflation)}</strong>. This
                  means that <strong>£1</strong> then has the same purchasing
                  power as <strong>£{data.exampleInflationValue}</strong> today.
                </div>
              </SummaryCardLeft>
              <SummaryCardRight>
                <div className="flex-1">
                  <div className="text-xl font-bold">{data.timePeriod}</div>
                </div>
                <div className="ml-3 w-6 flex items-center justify-center">
                  <CalendarDateRangeIcon />
                </div>
              </SummaryCardRight>
            </SummaryCard>

            <SummaryCard>
              <SummaryCardLeft>
                <div className="text-md text-default-700">
                  This is the amount that your salary has increased, ignoring
                  inflation, over the all the entries you’ve provided.
                </div>
              </SummaryCardLeft>
              <SummaryCardRight>
                <div className="flex-1">
                  <div className="text-sm text-default-600">
                    Overall Nominal Change
                  </div>
                  <div className="text-xl font-bold">
                    {formatters.pct(data.overallNominalChange)}
                  </div>
                  <div
                    className={clsx(
                      'text-sm',
                      data.overallNominalChangeAmount > 0
                        ? 'text-success-700 dark:text-success'
                        : 'text-danger-600 dark:text-danger-500'
                    )}
                  >
                    or {formatters.currency(data.overallNominalChangeAmount)}
                  </div>
                </div>
                <div className="ml-3 w-6 flex items-center justify-center">
                  {trendIcon(data.overallNominalChange)}
                </div>
              </SummaryCardRight>
            </SummaryCard>

            <SummaryCard>
              <SummaryCardLeft>
                <div className="text-md text-default-700">
                  Factoring in inflation to your salary history, this is how
                  much it has changed in terms of real spending power.
                </div>
              </SummaryCardLeft>
              <SummaryCardRight>
                <div className="flex-1">
                  <div className="text-sm text-default-600">
                    Overall Adjusted Change
                  </div>
                  <div className="text-xl font-bold">
                    {formatters.pct(data.overallAdjustedChange)}
                  </div>
                </div>
                <div className="ml-3 w-6 flex items-center justify-center">
                  {trendIcon(data.overallAdjustedChange)}
                </div>
              </SummaryCardRight>
            </SummaryCard>

            <SummaryCard>
              <SummaryCardLeft>
                <div className="text-md text-default-700">
                  The cumulative average increase in pay over the UK, pro-rated
                  to the time period you’ve provided.
                  <br />
                  Generally, this is how much everyone else’s salary has
                  increased over the same time.
                </div>
              </SummaryCardLeft>
              <SummaryCardRight>
                <div className="flex-1">
                  <div className="text-sm text-default-600">
                    UK Median Pay Rise
                  </div>
                  <div className="text-xl font-bold">
                    {formatters.pct(data.averagePayRiseOverPeriod)}
                  </div>
                  <div className="text-sm text-default-500">
                    {formatters.pct(
                      data.averagePayRiseOverPeriod - data.overallInflation
                    )}{' '}
                    inflation adjusted
                  </div>
                </div>
                <div className="ml-3 w-6 flex items-center justify-center">
                  {trendIcon(data.averagePayRiseOverPeriod)}
                </div>
              </SummaryCardRight>
            </SummaryCard>
          </SummaryCardGrid>
        </div>
        <div
          className={clsx(
            'absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-200',
            data.showSummary
              ? 'opacity-0 pointer-events-none'
              : 'opacity-100 pointer-events-auto'
          )}
        >
          <div className="w-full h-full flex items-center justify-center rounded-md bg-white/20 backdrop-blur-xs border border-white/10 text-default-900 p-4">
            <div className="text-center shadow p-6 rounded-md backdrop-blur-3xl">
              <h4 className="text-lg font-semibold">
                Add at least two salaries <br className="block md:hidden" />
                to see more stats
              </h4>
              <p className="mt-2 text-sm">
                {entries.length === 1
                  ? 'Just one more to go.'
                  : 'Start by adding your most recent salary.'}
              </p>
            </div>
          </div>
        </div>
      </CardBody>

      {entries.length > 0 && (
        <CardFooter className="flex flex-col justify-center space-y-2 text-center animate-flip-down">
          <p>
            Want to see how much you should ask for next?{' '}
            <br className="block md:hidden" />
            Scroll down and see.
          </p>
          <ArrowDownIcon className="size-8 animate-bounce" />
        </CardFooter>
      )}
    </Card>
  )
}
