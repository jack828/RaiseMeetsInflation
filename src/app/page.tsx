'use client'

import { useState } from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
  Spacer
} from '@heroui/react'

interface SalaryEntry {
  id: string
  date: string
  amount: number
  inflationAdjusted: number
  difference: number
}

// Placeholder CPIH data (monthly % change)
const cpihData: Record<string, number> = {
  '2020-01': 2.1,
  '2020-02': 2.3,
  '2020-03': 2.5,
  '2020-04': 2.0,
  '2020-05': 2.2,
  '2020-06': 2.4,
  '2020-07': 2.8,
  '2020-08': 3.1,
  '2020-09': 3.4,
  '2020-10': 3.7,
  '2020-11': 3.9,
  '2020-12': 4.1,
  '2021-01': 4.2,
  '2021-02': 4.4,
  '2021-03': 4.5,
  '2021-04': 4.3,
  '2021-05': 4.1,
  '2021-06': 3.9,
  '2021-07': 3.8,
  '2021-08': 3.5,
  '2021-09': 3.3,
  '2021-10': 3.1,
  '2021-11': 2.9,
  '2021-12': 2.7,
  '2022-01': 2.5,
  '2022-02': 2.8,
  '2022-03': 3.2,
  '2022-04': 3.6,
  '2022-05': 4.0,
  '2022-06': 4.5,
  '2022-07': 5.0,
  '2022-08': 5.2,
  '2022-09': 5.5,
  '2022-10': 5.7,
  '2022-11': 5.8,
  '2022-12': 5.9,
  '2023-01': 5.8,
  '2023-02': 5.6,
  '2023-03': 5.3,
  '2023-04': 4.9,
  '2023-05': 4.5,
  '2023-06': 4.1,
  '2023-07': 3.8,
  '2023-08': 3.5,
  '2023-09': 3.2,
  '2023-10': 2.9,
  '2023-11': 2.7,
  '2023-12': 2.5,
  '2024-01': 2.4,
  '2024-02': 2.3,
  '2024-03': 2.2,
  '2024-04': 2.1,
  '2024-05': 2.0,
  '2024-06': 2.1,
  '2024-07': 2.2,
  '2024-08': 2.3,
  '2024-09': 2.4,
  '2024-10': 2.5,
  '2024-11': 2.6
}

export default function SalaryInflationPage() {
  const [salaries, setSalaries] = useState<SalaryEntry[]>([])
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')

  const calculateInflationAdjusted = (
    originalAmount: number,
    originalDate: string,
    targetDate: string = new Date().toISOString().slice(0, 7)
  ): number => {
    const startDate = new Date(originalDate)
    const endDate = new Date(targetDate)

    let cumulativeInflation = 0
    const current = new Date(startDate)

    while (current <= endDate) {
      const monthKey = current.toISOString().slice(0, 7)
      const monthlyRate = cpihData[monthKey] || 0 
      cumulativeInflation += monthlyRate / 12 // Convert annual to monthly
      current.setMonth(current.getMonth() + 1)
    }

    return originalAmount * (1 + cumulativeInflation / 100)
  }

  const addSalary = () => {
    if (!date || !amount) return

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount)) return

    const inflationAdjusted = calculateInflationAdjusted(parsedAmount, date)
    const difference =
      ((parsedAmount - inflationAdjusted) / inflationAdjusted) * 100

    const newEntry: SalaryEntry = {
      id: Date.now().toString(),
      date,
      amount: parsedAmount,
      inflationAdjusted,
      difference
    }

    setSalaries(
      [...salaries, newEntry].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    )

    setDate('')
    setAmount('')
  }

  const removeSalary = (id: string) => {
    setSalaries(salaries.filter((s) => s.id !== id))
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Card className="shadow-xl">
          <CardHeader className="pb-4">
            <h1 className="text-3xl font-bold">Salary vs Inflation Tracker</h1>
          </CardHeader>
          <CardBody>
            <p className="text-default-600">
              Track how your salary changes compare to UK inflation rates (CPIH)
            </p>
          </CardBody>
        </Card>

        <Spacer y={2} />

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-semibold">Add Salary Entry</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                type="month"
                label="Month & Year"
                placeholder="YYYY-MM"
                pattern="[0-9]{4}-[0-9]{2}"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                variant="bordered"
              />
              <Input
                type="text"
                label="Salary Amount"
                placeholder="9001"
                pattern="[0-9]+"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">£</span>
                  </div>
                }
                variant="bordered"
              />
              <Button
                color="primary"
                size="lg"
                onPress={addSalary}
                className="w-full"
                isDisabled={!date || !amount}
              >
                Add Salary
              </Button>
            </CardBody>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <h2 className="text-xl font-semibold">Summary</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-default-600">Total Entries</span>
                  <span className="text-2xl font-bold">{salaries.length}</span>
                </div>
                <Divider />
                <div className="flex justify-between items-center">
                  <span className="text-default-600">Average Real Change</span>
                  <Chip
                    color={
                      salaries.length === 0
                        ? 'default'
                        : salaries.reduce((acc, s) => acc + s.difference, 0) /
                              salaries.length >
                            0
                          ? 'success'
                          : 'danger'
                    }
                    variant="flat"
                  >
                    {salaries.length === 0
                      ? 'N/A'
                      : `${(
                          salaries.reduce((acc, s) => acc + s.difference, 0) /
                          salaries.length
                        ).toFixed(2)}%`}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Spacer y={2} />

        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold">Salary History</h2>
          </CardHeader>
          <CardBody>
            {salaries.length > 0 ? (
              <Table aria-label="Salary history table" removeWrapper>
                <TableHeader>
                  <TableColumn>DATE</TableColumn>
                  <TableColumn>ACTUAL SALARY</TableColumn>
                  <TableColumn>INFLATION ADJUSTED</TableColumn>
                  <TableColumn>REAL CHANGE</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>{formatDate(salary.date)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(salary.amount)}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(salary.inflationAdjusted)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={salary.difference > 0 ? 'success' : 'danger'}
                          variant="flat"
                          size="sm"
                        >
                          {salary.difference > 0 ? '+' : ''}
                          {salary.difference.toFixed(2)}%
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => removeSalary(salary.id)}
                        >
                          ✕
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-default-400">
                No salary entries yet. Add your first salary above.
              </div>
            )}
          </CardBody>
        </Card>

        <Spacer y={2} />

        <Card className="shadow-lg">
          <CardHeader>
            <h2 className="text-xl font-semibold">Visualization</h2>
          </CardHeader>
          <CardBody>
            <div className="h-64 bg-default-100 rounded-lg flex items-center justify-center">
              <p className="text-default-400">
                Chart placeholder - Salary vs Inflation over time
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
