import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
  Input,
  Switch,
  Selection
} from '@heroui/react'
import clsx from 'clsx'

import { getSelectionValue, SalaryEntry, toSalaryEntry } from '@/lib'

interface SalaryInputSectionProps {
  handleAddSalary: (entry: SalaryEntry) => void
}

const months = [
  { key: '01', label: '01 - January' },
  { key: '02', label: '02 - February' },
  { key: '03', label: '03 - March' },
  { key: '04', label: '04 - April' },
  { key: '05', label: '05 - May' },
  { key: '06', label: '06 - June' },
  { key: '07', label: '07 - July' },
  { key: '08', label: '08 - August' },
  { key: '09', label: '09 - September' },
  { key: '10', label: '10 - October' },
  { key: '11', label: '11 - November' },
  { key: '12', label: '12 - December' }
]

const MIN_YEAR = 2015
const years = new Array(new Date().getFullYear() - MIN_YEAR + 1)
  .fill(0)
  .map((_, i) => ({ key: `${i + MIN_YEAR}`, label: `${i + MIN_YEAR}` }))

interface SalaryInputFormProps {
  handleAddSalary?: (entry: SalaryEntry) => void
  handleEditSalary?: (entry: SalaryEntry) => void
  initialEntry?: SalaryEntry
}

export const SalaryInputForm: React.FC<SalaryInputFormProps> = ({
  handleAddSalary,
  handleEditSalary,
  initialEntry
}) => {
  const [inputMonth, setInputMonth] = useState<Selection>(
    new Set(initialEntry ? [initialEntry.month] : [])
  )
  const [inputYear, setInputYear] = useState<Selection>(
    new Set(initialEntry ? [initialEntry.year] : [])
  )
  const [annual, setAnnual] = useState<string>(
    initialEntry && !initialEntry.isHourly ? initialEntry.amount.toString() : ''
  )
  const [hourlyRate, setHourlyRate] = useState<string>(
    String(initialEntry?.hourlyRate ?? '')
  )
  const [hoursPerWeek, setHoursPerWeek] = useState<string>(
    String(initialEntry?.hoursPerWeek ?? '')
  )
  const [isHourly, setIsHourly] = useState(initialEntry?.isHourly || false)
  const isEditing = Boolean(initialEntry)

  const parseNumberInput = (raw: string) => {
    const n = Number(raw.replace(/[,£\s]/g, ''))
    return Number.isNaN(n) ? null : n
  }

  const computedAnnual = useMemo(() => {
    const rate = parseNumberInput(hourlyRate)
    const hours = parseNumberInput(hoursPerWeek)
    if (!rate || !hours) return null
    return rate * hours * 52
  }, [hourlyRate, hoursPerWeek])

  const getAmount = () => {
    let amount: number | null = null
    if (!isHourly) {
      if (!annual) return
      amount = parseNumberInput(annual)
    } else {
      if (!hourlyRate || !hoursPerWeek) return
      amount = computedAnnual
    }
    if (amount === null || amount === undefined) return
    if (Number.isNaN(amount) || amount <= 0) return

    return amount
  }

  const addEntry = () => {
    if (!getSelectionValue(inputMonth) || !getSelectionValue(inputYear)) return

    const date = `${getSelectionValue(inputYear)}-${getSelectionValue(inputMonth)}`
    const amount = getAmount()

    if (!amount) {
      return
    }

    handleAddSalary?.(
      toSalaryEntry(
        date,
        amount,
        isHourly,
        parseNumberInput(hourlyRate)!,
        parseNumberInput(hoursPerWeek)!
      )
    )

    setInputMonth(new Set([]))
    setInputYear(new Set([]))
    setAnnual('')
    setHourlyRate('')
    setHoursPerWeek('')
  }

  const isDisabled = useMemo(() => {
    if (!getSelectionValue(inputMonth) || !getSelectionValue(inputYear)) {
      return true
    }
    if (!isHourly) {
      const amt = parseNumberInput(annual)
      return !annual || amt === null || amt <= 0
    } else {
      return (
        !hourlyRate ||
        !hoursPerWeek ||
        computedAnnual === null ||
        computedAnnual <= 0
      )
    }
  }, [
    inputMonth,
    inputYear,
    isHourly,
    hourlyRate,
    hoursPerWeek,
    annual,
    computedAnnual
  ])

  useEffect(() => {
    if (!initialEntry || !handleEditSalary) {
      return
    }

    const amount = getAmount()
    const date = `${getSelectionValue(inputYear)}-${getSelectionValue(inputMonth)}`
    if (!amount) {
      return
    }

    handleEditSalary({
      ...toSalaryEntry(
        date,
        amount,
        isHourly,
        parseNumberInput(hourlyRate)!,
        parseNumberInput(hoursPerWeek)!
      ),
      id: initialEntry.id
    })
  }, [
    inputMonth,
    inputYear,
    isHourly,
    hourlyRate,
    hoursPerWeek,
    annual,
    computedAnnual
  ])
  const handleEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !isDisabled) {
      addEntry()
    }
  }

  const handleToggle = (selected: boolean) => {
    setIsHourly(selected)
    if (!isEditing) {
      setHourlyRate('')
      setHoursPerWeek('')
      setAnnual('')
    }
  }

  return (
    <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
      <Select
        className="col-span-2 sm:col-span-1"
        label="Month"
        placeholder="-- Select Month --"
        selectedKeys={inputMonth}
        onSelectionChange={setInputMonth}
      >
        {months.map((month) => (
          <SelectItem key={month.key}>{month.label}</SelectItem>
        ))}
      </Select>
      <Select
        className="col-span-2 sm:col-span-1"
        label="Year"
        placeholder="-- Select Year --"
        selectedKeys={inputYear}
        onSelectionChange={setInputYear}
      >
        {years.map((year) => (
          <SelectItem key={year.key}>{year.label}</SelectItem>
        ))}
      </Select>
      <div
        className={clsx(
          'flex items-center justify-center space-x-2 col-span-2',
          { 'md:col-span-1': !isEditing }
        )}
      >
        <p className="cursor-pointer" onClick={() => handleToggle(!isHourly)}>
          Annual
        </p>
        <Switch
          isSelected={isHourly}
          onValueChange={handleToggle}
          size="md"
          color="primary"
        >
          Hourly
        </Switch>
      </div>
      {!isEditing && (
        <div className="flex items-center order-last md:order-[unset] md:col-span-1 col-span-2">
          <Button
            color="primary"
            onPress={addEntry}
            className="w-full"
            isDisabled={isDisabled}
          >
            Add Entry
          </Button>
        </div>
      )}
      {isHourly ? (
        <>
          <Input
            type="text"
            inputMode="decimal"
            label="Hourly Rate"
            className="col-span-2 sm:col-span-1 md:col-span-2"
            placeholder="15.00"
            value={hourlyRate}
            onValueChange={setHourlyRate}
            onKeyUp={handleEnter}
            classNames={{
              helperWrapper: computedAnnual && 'animate-flip-down'
            }}
            description={
              computedAnnual && (
                <span className="text-default-400 text-small">
                  That&apos;s £{computedAnnual?.toLocaleString()} per year.
                </span>
              )
            }
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">£</span>
              </div>
            }
            variant="bordered"
          />
          <Input
            type="number"
            inputMode="decimal"
            label="Hours per Week"
            className="col-span-2 sm:col-span-1 md:col-span-2"
            placeholder="40"
            value={hoursPerWeek}
            onValueChange={setHoursPerWeek}
            onKeyUp={handleEnter}
            variant="bordered"
          />
        </>
      ) : (
        <Input
          type="text"
          inputMode="decimal"
          label="Annual Salary"
          className="md:col-span-4 col-span-2"
          placeholder="9,001"
          value={annual}
          onValueChange={setAnnual}
          onKeyUp={handleEnter}
          startContent={
            <div className="pointer-events-none flex items-center">
              <span className="text-default-400 text-small">£</span>
            </div>
          }
          variant="bordered"
        />
      )}
    </div>
  )
}

interface SalaryInputSectionProps {
  handleAddSalary: (entry: SalaryEntry) => void
}

export const SalaryInputSection: React.FC<SalaryInputSectionProps> = ({
  handleAddSalary
}) => {
  return (
    <>
      <Card className="shadow p-4">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Pay Input</h1>
        </CardHeader>

        <CardBody>
          <SalaryInputForm handleAddSalary={handleAddSalary} />
        </CardBody>
      </Card>
    </>
  )
}
