import { useMemo, useState } from 'react'
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

export const SalaryInputSection: React.FC<SalaryInputSectionProps> = ({
  handleAddSalary
}) => {
  const [inputMonth, setInputMonth] = useState<Selection>(new Set([]))
  const [inputYear, setInputYear] = useState<Selection>(new Set([]))
  const [annual, setAnnual] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [hoursPerWeek, setHoursPerWeek] = useState('')
  const [isHourly, setIsHourly] = useState(true)

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

  const addEntry = () => {
    if (!getSelectionValue(inputMonth) || !getSelectionValue(inputYear)) return

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

    const date = `${getSelectionValue(inputYear)}-${getSelectionValue(inputMonth)}`
    handleAddSalary(toSalaryEntry(date, amount))

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
      console.log({ amt, annual })
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

  const handleToggle = (selected: boolean) => {
    setIsHourly(selected)
    setHourlyRate('')
    setHoursPerWeek('')
    setAnnual('')
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Pay Input</h1>
        </CardHeader>

        <CardBody>
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
            <div className="flex items-center justify-center space-x-2 md:col-span-1 col-span-2">
              <p
                className="cursor-pointer"
                onClick={() => handleToggle(!isHourly)}
              >
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
            {isHourly ? (
              <>
                <Input
                  type="text"
                  inputMode="decimal"
                  label="Hourly Rate"
                  className="col-span-2 sm:col-span-1 md:col-span-2"
                  placeholder="15.00"
                  value={hourlyRate}
                  description={
                    computedAnnual && (
                      <span className="text-default-400 text-small">
                        That&apos;s £{computedAnnual?.toLocaleString()} per
                        year.
                      </span>
                    )
                  }
                  onValueChange={setHourlyRate}
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
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">£</span>
                  </div>
                }
                variant="bordered"
              />
            )}
          </div>
        </CardBody>
      </Card>
    </>
  )
}
