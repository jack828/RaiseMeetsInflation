import { useMemo, useState } from 'react'
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
  Tooltip,
  CardFooter,
  ButtonGroup,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from '@heroui/react'
import {
  ArrowDownIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  TrashIcon
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
import { SalaryInputForm } from './salary-input-section'

interface SalaryHistorySectionProps {
  entries: SalaryEntry[]
  handleRemoveSalary: (id: string) => void
  handleEditSalary: (entry: SalaryEntry) => void
}

type SalaryHistoryRow = {
  entry: SalaryEntry
  prevPct?: number // % difference vs previous nominal
  inflationAdjusted?: number // what previous salary would need to be to match inflation to this date
  inflationPct?: number // % inflation over period from previous to this date
  realPct?: number // % difference of this salary vs inflation-adjusted amount
}
export const SalaryHistorySection: React.FC<SalaryHistorySectionProps> = ({
  entries,
  handleEditSalary,
  handleRemoveSalary
}) => {
  const [removingRowIds, setRemovingRowIds] = useState<Record<string, boolean>>(
    {}
  )
  const rows: SalaryHistoryRow[] = useMemo(() => {
    return entries.map((entry, i, arr) => {
      if (i === 0) {
        return { entry }
      }
      const prev = arr[i - 1]
      // nominal % change vs previous
      const prevPct = pctDifference(entry.amount, prev.amount)

      // compound inflation from prev.date to entry.date
      const inflationMultiplier = compoundMultiplier(
        prev.datetime,
        entry.datetime,
        datasets.getInflationValue
      )
      const inflationAdjusted = +(prev.amount * inflationMultiplier).toFixed(2)
      const inflationPct = multiplierToPct(inflationMultiplier)

      // real % difference of actual new salary vs inflation-adjusted value
      const realPct = pctDifference(entry.amount, inflationAdjusted)

      return {
        entry,
        prevPct,
        inflationAdjusted,
        inflationPct,
        realPct
      }
    })
  }, [entries, removingRowIds])

  const handleAnimationEnd = (id: string) => () => {
    handleRemoveSalary(id)
    setRemovingRowIds((ids) => {
      delete ids[id]
      return ids
    })
  }
  const onRemove = (id: string) => {
    setRemovingRowIds((ids) => ({ ...ids, [id]: true }))
  }
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [editEntry, setEditEntry] = useState<SalaryEntry | null>(null)
  const onEdit = (entry: SalaryEntry) => {
    setEditEntry(entry)
    onOpen()
  }

  const handleSave = (onClose: () => void) => () => {
    console.log('saving', editEntry)

    if (editEntry) {
      handleEditSalary(editEntry)
    }
    onClose()
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit Salary Entry</ModalHeader>
              <ModalBody>
                {editEntry && (
                  <SalaryInputForm
                    initialEntry={editEntry}
                    handleEditSalary={setEditEntry}
                  />
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSave(onClose)}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Card className="shadow p-4">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Salary History</h2>
        </CardHeader>
        <CardBody className="font-mono px-2">
          <Table aria-label="Salary history table" removeWrapper>
            <TableHeader>
              <TableColumn>Date</TableColumn>
              <TableColumn>Salary</TableColumn>
              <TableColumn>Pay Difference</TableColumn>
              <TableColumn>
                <Tooltip
                  content={
                    <div className="px-1 py-2">
                      <div className="text-small">
                        How your new salary compares to the inflation-adjusted
                        value.
                        <br />
                        This is the “real” spending power change in your salary.
                        <br /> Negative values are a <strong>PAY CUT</strong>.
                      </div>
                    </div>
                  }
                  showArrow={true}
                >
                  <div className="flex">
                    Difference vs Inflation
                    <InformationCircleIcon className="inline w-4 ml-1" />
                  </div>
                </Tooltip>
              </TableColumn>
              <TableColumn>Inflation</TableColumn>
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
                  <div className="flex">
                    Inflation‑adjusted Salary
                    <InformationCircleIcon className="inline w-4 ml-1" />
                  </div>
                </Tooltip>
              </TableColumn>
              <TableColumn hideHeader>Actions</TableColumn>
            </TableHeader>
            <TableBody emptyContent="Nothing to see here. Put your current salary and the date you got it into the box above.">
              {rows.map((r, idx) => {
                const isRemoving = removingRowIds[r.entry.id]
                const cellClassName = clsx(
                  'transition-all duration-300 ease-in-out',
                  isRemoving && 'py-0 opacity-0 text-[0px]'
                )
                return (
                  <TableRow
                    key={r.entry.id}
                    className={clsx(
                      isRemoving &&
                        'animate-flip-down animate-reverse animate-once overflow-hidden bg-red-100' +
                          'transition-all duration-300 ease-in-out'
                    )}
                    onAnimationEnd={handleAnimationEnd(r.entry.id)}
                  >
                    <TableCell className={cellClassName}>
                      {r.entry.date}
                    </TableCell>
                    <TableCell className={clsx(cellClassName, 'font-semibold')}>
                      {formatters.currency(r.entry.amount)}
                    </TableCell>
                    <TableCell className={cellClassName}>
                      {formatters.pct(r.prevPct)}
                    </TableCell>
                    <TableCell className={cellClassName}>
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
                          className={clsx(
                            'transition-all duration-300 ease-in-out',
                            isRemoving && 'h-0 text-[0px]'
                          )}
                        >
                          {formatters.pct(r.realPct)}
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell className={cellClassName}>
                      {formatters.pct(r.inflationPct, false)}
                    </TableCell>
                    <TableCell className={cellClassName}>
                      {formatters.currency(r.inflationAdjusted)}
                    </TableCell>
                    <TableCell className={clsx(cellClassName, 'p-0')}>
                      <ButtonGroup>
                        <Button
                          isIconOnly
                          color="default"
                          variant="light"
                          size="sm"
                          className={clsx(
                            'transition-height duration-300 ease-in-out',
                            isRemoving && 'h-0'
                          )}
                          onPress={() => onEdit(r.entry)}
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </Button>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          className={clsx(
                            'transition-height duration-300 ease-in-out',
                            isRemoving && 'h-0'
                          )}
                          onPress={() => onRemove(r.entry.id)}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </Button>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardBody>

        {entries.length > 0 && (
          <CardFooter className="flex flex-col justify-center space-y-2 text-center">
            <p>
              Want to see how much you should ask for next?{' '}
              <br className="block md:hidden" />
              Scroll down and see.
            </p>
            <ArrowDownIcon className="size-8 animate-bounce" />
          </CardFooter>
        )}
      </Card>
    </>
  )
}
