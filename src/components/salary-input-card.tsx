import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
  Input
} from '@heroui/react'

import { SalaryEntry, toSalaryEntry } from '@/lib'

interface NextRaiseCardProps {
  handleAddSalary: (entry: SalaryEntry) => void
}

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

export const SalaryInputCard: React.FC<NextRaiseCardProps> = ({
  handleAddSalary
}) => {
  const [inputMonth, setInputMonth] = useState('')
  const [inputYear, setInputYear] = useState('')
  const [amount, setAmount] = useState('')

  const addEntry = () => {
    if (!inputMonth || !inputYear || !amount) return
    const amt = Number(amount.replace(/[,£\s]/g, ''))
    if (Number.isNaN(amt) || amt <= 0) return
    const date = `${inputYear}-${inputMonth}`
    handleAddSalary(toSalaryEntry(date, amt))

    setInputMonth('')
    setInputYear('')
    setAmount('')
  }

  return (
    <>
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
    </>
  )
}
