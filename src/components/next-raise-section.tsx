import { useMemo } from 'react'
import { Card, CardHeader, CardBody, CardFooter } from '@heroui/react'

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

interface NextRaiseSectionProps {
  entries: SalaryEntry[]
  inflationType: InflationType
}

export const NextRaiseSection: React.FC<NextRaiseSectionProps> = ({
  entries,
  inflationType
}) => {
  const data = useMemo(() => {
    if (!entries || entries.length === 0) return null

    const now = new Date()
    const last = entries[entries.length - 1]
    const lastDate = last.datetime
    const lastAmount = last.amount
    const timePeriod = formatters.timePeriod(lastDate, now)

    const inflationMultiplier = compoundMultiplier(
      lastDate,
      now,
      datasets.getInflationValue(inflationType)
    )
    const inflationTargetSalary = +(lastAmount * inflationMultiplier).toFixed(2)
    const inflationPct = multiplierToPct(inflationMultiplier)
    const askRestorePct = pctDifference(inflationTargetSalary, lastAmount)
    const askRestoreAmount = inflationTargetSalary - lastAmount

    const payGrowthMultiplier = compoundMultiplier(
      lastDate,
      now,
      datasets.getPayGrowthValue
    )
    const marketTargetSalary = +(lastAmount * payGrowthMultiplier).toFixed(2)
    const payGrowthPct = multiplierToPct(payGrowthMultiplier)
    const payGrowthAmount = marketTargetSalary - lastAmount

    return {
      timePeriod,
      lastDate,
      lastAmount,
      inflationTargetSalary,
      inflationPct,
      askRestorePct,
      askRestoreAmount,
      marketTargetSalary,
      payGrowthPct,
      payGrowthAmount
    }
  }, [entries, inflationType])

  if (!data) {
    return (
      <Card className="shadow">
        <CardHeader>
          <h1 className="text-lg font-medium">Your next raise</h1>
        </CardHeader>
        <CardBody>
          <div className="text-sm text-default-600">
            Add at least one salary entry to see recommendations.
          </div>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="shadow">
      <CardHeader>
        <h1 className="text-lg font-medium">Your next raise</h1>
      </CardHeader>

      <CardBody className="animate-flip-down">
        <SummaryCardGrid>
          <SummaryCard>
            <SummaryCardLeft>
              <div className="text-md text-default-700">
                Salary required now to restore the purchasing power of your last
                recorded pay, given the current inflation of{' '}
                <strong>{formatters.pct(data.inflationPct)}</strong> over the
                last <strong>{data.timePeriod}</strong> since your last raise.
              </div>
            </SummaryCardLeft>

            <SummaryCardRight>
              <div className="flex-1">
                <div className="text-sm text-default-600">
                  To restore purchasing power
                </div>
                <div className="text-xl font-bold">
                  {formatters.currency(data.inflationTargetSalary)}
                </div>

                <div className="text-sm text-default-500">
                  {formatters.pct(data.askRestorePct)} or{' '}
                  {formatters.currency(data.askRestoreAmount)}
                </div>
              </div>
              <div className="ml-3 w-6 flex items-center justify-center">
                {trendIcon(data.askRestorePct)}
              </div>
            </SummaryCardRight>
          </SummaryCard>

          <SummaryCard>
            <SummaryCardLeft>
              <div className="text-md text-default-700">
                To match the market median growth since your last raise, this is
                what you’d need. It’s{' '}
                <strong>
                  {formatters.pct(data.payGrowthPct - data.inflationPct)}
                </strong>{' '}
                above the rate of inflation.
              </div>
            </SummaryCardLeft>

            <SummaryCardRight>
              <div className="flex-1">
                <div className="text-sm text-default-600">
                  To match the market median growth
                </div>
                <div className="text-xl font-bold">
                  {formatters.currency(data.marketTargetSalary)}
                </div>

                <div className="text-sm text-default-500">
                  {formatters.pct(data.payGrowthPct)} or{' '}
                  {formatters.currency(data.payGrowthAmount)}
                </div>
              </div>
              <div className="ml-3 w-6 flex items-center justify-center">
                {trendIcon(data.payGrowthPct)}
              </div>
            </SummaryCardRight>
          </SummaryCard>
        </SummaryCardGrid>
      </CardBody>

      <CardFooter className="animate-flip-down">
        <p className="text-sm text-default-500">
          This may be different to other sites, as we look at the inflation
          since your last wage - not just in the last 12 months. This should be
          more accurate to what you should ask for.
        </p>
      </CardFooter>
    </Card>
  )
}
