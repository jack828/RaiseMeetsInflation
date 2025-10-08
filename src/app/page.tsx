'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody, Divider } from '@heroui/react'
import { SalaryEntry, toSalaryEntry } from '@/lib'
import { NextRaiseSection } from '@/components/next-raise-section'
import { SalaryInputSection } from '@/components/salary-input-section'
import { SummarySection } from '@/components/summary-section'
import { SalaryHistorySection } from '@/components/salary-history-section'
import { Advert } from '@/components/advert'
import { Footer } from '@/components/footer'
import { DisclaimerSection } from '@/components/disclaimer-section'

const devEntries: SalaryEntry[] = [
  toSalaryEntry('2016-07', 15392, '00000000-0000-0000-0000-000000000001'),
  toSalaryEntry('2016-09', 15392, '00000000-0000-0000-0000-000000000002'),
  toSalaryEntry('2017-06', 17000, '00000000-0000-0000-0000-000000000003'),
  toSalaryEntry('2018-08', 24992.76, '00000000-0000-0000-0000-000000000004'),
  toSalaryEntry('2019-05', 27000, '00000000-0000-0000-0000-000000000005'),
  toSalaryEntry('2019-06', 29000, '00000000-0000-0000-0000-000000000006'),
  toSalaryEntry('2021-04', 34000, '00000000-0000-0000-0000-000000000007'),
  toSalaryEntry('2022-01', 40000, '00000000-0000-0000-0000-000000000008'),
  toSalaryEntry('2022-06', 50000, '00000000-0000-0000-0000-000000000009'),
  toSalaryEntry('2023-08', 75000, '00000000-0000-0000-0000-000000000010'),
  toSalaryEntry('2024-01', 78187.5, '00000000-0000-0000-0000-000000000011'),
  toSalaryEntry('2025-02', 83000, '00000000-0000-0000-0000-000000000012')
]
const initialEntries = process.env.NODE_ENV === 'development' ? devEntries : []

export default function SalaryInflationPage() {
  const [entries, setEntries] = useState<SalaryEntry[]>(initialEntries)

  const onAddSalary = (entry: SalaryEntry) => {
    setEntries((s) =>
      s
        .concat(entry)
        .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
    )
  }

  const onRemoveSalary = (id: string) =>
    setEntries((s) => s.filter((r) => r.id !== id))

  return (
      <div className="space-y-6">
        {/*
          TODO TODO TODO TODO
          vertical sidebar ads on desktop
          analytics
          graph
          ads
        */}

        <Card className="shadow p-4">
          <CardHeader className="">
            <h2 className="text-2xl font-semibold">How to Use</h2>
          </CardHeader>

          <CardBody className="space-y-2">
            <p>
              Want a pay rise but aren’t sure what to ask for?
              RaiseMeetsInflation lets you enter your salary history and
              instantly compares it to inflation, market‑wide median growth, and
              the raise you’d earn if you negotiated today.
            </p>

            <p>
              <strong>Why inflation matters:</strong> If your salary grows
              slower than inflation, your purchasing power actually declines. In
              real terms, you are taking a <strong>pay cut</strong> while doing
              the same work.
            </p>

            <p>
              This tool highlights long‑term trends so you can make a data
              driven case to your employer. Whether you’re waiting for a long
              overdue boost or just curious how your earnings stack up after a
              job change, the calculator shows you exactly where you stand.
            </p>
          </CardBody>
        </Card>

        <Advert />

        <SalaryInputSection handleAddSalary={onAddSalary} />

        <SalaryHistorySection
          entries={entries}
          handleRemoveSalary={onRemoveSalary}
        />

        <Advert />

        <SummarySection entries={entries} />

        <NextRaiseSection entries={entries} />

        <Advert />

        {/*
        <Card className="shadow p-4">
          <CardHeader>
            <h2 className="text-2xl font-semibold">Visualisation</h2>
          </CardHeader>
          <CardBody>
            <div className="h-64 bg-default-100 rounded-lg flex items-center justify-center">
              <p className="text-default-400">Chart placeholder</p>
            </div>
          </CardBody>
        </Card>

        <Advert />
        */}

        <DisclaimerSection />

        <Divider />

        <Footer />
    </div>
  )
}
