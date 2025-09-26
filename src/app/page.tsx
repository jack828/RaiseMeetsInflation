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

export type InflationType = 'cpih' | 'cpi'
const inflationType: InflationType = 'cpih'

export default function SalaryInflationPage() {
  const [entries, setEntries] = useState<SalaryEntry[]>([
    toSalaryEntry('2016-07', 15392),
    toSalaryEntry('2016-09', 15392),
    toSalaryEntry('2017-06', 17000),
    toSalaryEntry('2018-08', 24992.76),
    toSalaryEntry('2019-05', 27000),
    toSalaryEntry('2019-06', 29000),
    toSalaryEntry('2021-04', 34000),
    toSalaryEntry('2022-01', 40000),
    toSalaryEntry('2022-06', 50000),
    toSalaryEntry('2023-08', 75000),
    toSalaryEntry('2024-01', 78187.5),
    toSalaryEntry('2025-02', 83000)
  ])

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/*<Card className="shadow">
          <CardHeader>
            <h1 className="text-2xl font-semibold">TODO</h1>
          </CardHeader>

          <CardBody>
            <ul className="list-disc list-inside">
              {[
                'nicer styling',
                'graph',
                'ads',
                'inflation metric selector'
              ].map((item, i) => (
                <li key={`${i}`}>{item}</li>
              ))}
            </ul>
          </CardBody>
        </Card>*/}

        <Card className="shadow p-4">
          <CardHeader className="">
            <h2 className="text-2xl font-semibold">How to Use</h2>
          </CardHeader>

          <CardBody className="space-y-2">
            <p>
              Want a pay‑rise but aren’t sure what to ask
              for? RaiseMeetsInflation lets you enter your salary history and
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
              This tool highlights long‑term trends so you can make a
              data‑driven case to your employer. Whether you’re waiting for a
              long‑overdue boost or just curious how your earnings stack up
              after a job change, the calculator shows you exactly where you
              stand.
            </p>
          </CardBody>
        </Card>
        <Advert />

        <SalaryInputSection handleAddSalary={onAddSalary} />

        <SummarySection entries={entries} inflationType={inflationType} />

        <Advert />

        <SalaryHistorySection
          entries={entries}
          inflationType={inflationType}
          handleRemoveSalary={onRemoveSalary}
        />

        <NextRaiseSection entries={entries} inflationType={inflationType} />

        <Advert />

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

        <DisclaimerSection />

        <Divider />

        <Footer />
      </div>
    </div>
  )
}
