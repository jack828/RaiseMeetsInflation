import { useMemo } from 'react'
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
  Tooltip
} from '@heroui/react'
import { TrashIcon } from '@heroicons/react/24/outline'
import {
  compoundMultiplier,
  multiplierToPct,
  pctDifference,
  SalaryEntry
} from '@/lib'
import * as formatters from '@/formatters'
import * as datasets from '@/datasets'
import { InflationType } from '@/app/page'

interface SalaryHistorySectionProps {
  entries: SalaryEntry[]
  inflationType: InflationType
  handleRemoveSalary: (id: string) => void
}

export const SalaryHistorySection: React.FC<SalaryHistorySectionProps> = ({
  entries,
  inflationType,
  handleRemoveSalary
}) => {
  const rows = useMemo(() => {
    return entries.map((entry, i, arr) => {
      if (i === 0) return { ...entry } as SalaryEntry
      const prev = arr[i - 1]
      // nominal % change vs previous
      const prevPct = pctDifference(entry.amount, prev.amount)

      // compound inflation from prev.date to entry.date
      const inflationMultiplier = compoundMultiplier(
        prev.datetime,
        entry.datetime,
        datasets.getInflationValue(inflationType)
      )
      const inflationMatched = +(prev.amount * inflationMultiplier).toFixed(2)
      const inflationPct = multiplierToPct(inflationMultiplier)

      // real % difference of actual new salary vs inflation-matched value
      const realPct = pctDifference(entry.amount, inflationMatched)

      return {
        ...entry,
        prevPct,
        inflationMatched,
        inflationPct,
        realPct
      }
    })
  }, [entries])

  return (
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
                      What you would have gotten if your employer ONLY matched
                      to inflation. <br />
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
                      This is the “real” spending power change in your salary.
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
              <TableRow key={r.id} className="animate-flip-up">
                <TableCell>{r.date}</TableCell>
                <TableCell className="font-semibold">
                  {formatters.currency(r.amount)}
                </TableCell>
                <TableCell>
                  {formatters.pct(r.prevPct)}
                </TableCell>
                <TableCell>
                  {formatters.pct(r.inflationPct, false)}
                </TableCell>
                <TableCell>
                  {formatters.currency(r.inflationMatched)}
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
                    onPress={() => handleRemoveSalary(r.id)}
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
  )
}
