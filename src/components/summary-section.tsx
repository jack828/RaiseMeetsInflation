import { useMemo } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/react'
import {
  ArrowDownIcon,
  CalendarDateRangeIcon
} from '@heroicons/react/24/outline'

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
    if (!entries || entries.length < 2) return null

    const first = entries[0]
    const last = entries[entries.length - 1]
    const timePeriod = formatters.timePeriod(first.datetime, last.datetime)
    const payGrowthMultiplier = compoundMultiplier(
      first.datetime,
      last.datetime,
      datasets.getPayGrowthValue
    )
    const averagePayRiseOverPeriod = multiplierToPct(payGrowthMultiplier)

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
    return {
      timePeriod,
      averagePayRiseOverPeriod,
      overallAdjustedChange,
      overallInflation,
      exampleInflationValue,
      overallNominalChange
    }
  }, [entries, inflationType])

  if (!data) {
    return (
      <Card className="shadow">
        <CardHeader>
          <h1 className="text-lg font-medium">Summary</h1>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-default-600">
            Add at least two salary entries to see a summary.
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <h2 className="text-lg font-medium">Summary</h2>
      </CardHeader>
      <CardBody>
        <SummaryCardGrid>
          <SummaryCard>
            <SummaryCardLeft>
              <div className="text-md text-default-700">
                Based on your chosen inflation metric, over {data.timePeriod}{' '}
                inflation has risen by {formatters.pct(data.overallInflation)}.
                This means that £1 then has the same purchasing power as £
                {data.exampleInflationValue} today.
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
              </div>
              <div className="ml-3 w-6 flex items-center justify-center">
                {trendIcon(data.overallNominalChange)}
              </div>
            </SummaryCardRight>
          </SummaryCard>

          <SummaryCard>
            <SummaryCardLeft>
              <div className="text-md text-default-700">
                Factoring in inflation to your salary history, this is how much
                it has changed in terms of real spending power.
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
                The cumulative average increase in pay over the UK, pro-rated to
                the time period you’ve provided.
                <br />
                Generally, this is how much everyone else’s salary has increased
                over the same time.
              </div>
            </SummaryCardLeft>
            <SummaryCardRight>
              <div className="flex-1">
                <div className="text-sm text-default-600">
                  Average Pay Rise Over Period
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
      </CardBody>

      <CardFooter className="flex flex-col justify-center space-y-2">
        <p>
          Want to see how much you should ask for next? Scroll down and see.
        </p>
        <ArrowDownIcon className="size-6 animate-bounce" />
      </CardFooter>
    </Card>
  )
}
