'use client'

import { useState } from 'react'
import { Card, CardHeader, CardBody, Divider } from '@heroui/react'
import Image from 'next/image'
import { SalaryEntry, toSalaryEntry } from '@/lib'
import { NextRaiseSection } from '@/components/next-raise-section'
import { SalaryInputSection } from '@/components/salary-input-section'
import { SummarySection } from '@/components/summary-section'
import { SalaryHistorySection } from '@/components/salary-history-section'
import { Advert } from '@/components/advert'

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
                'opengraph / metadata',
                'icon/logo',
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

        <Card className="shadow p-4">
          <CardHeader>
            <h1 className="text-2xl font-semibold">Disclaimer & Sources</h1>
          </CardHeader>

          <CardBody className="space-y-2">
            <p className="text-sm text-default-600">
              This tool provides illustrative, approximate comparisons between
              your nominal salary changes and UK inflation. Information provided
              on this site is for illustrative purposes only. Do not make any
              major financial decisions without consulting a qualified
              specialist.
            </p>

            <ul className="list-disc ml-5 text-sm text-default-600">
              <li>
                Calculations use monthly CPIH/CPI annual rates converted to
                monthly multipliers and compounded between the selected months -
                different methods (e.g. interpolating daily rates, or using
                alternative indexing) will produce different results.
              </li>
              <li>
                Inflation data sourced from the UK Office for National
                Statistics (ONS):
                <div className="mt-1 space-y-1">
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/l55o/mm23"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ONS - CPIH ANNUAL RATE 00: ALL ITEMS 2015=100
                  </a>
                  <br />
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/d7g7/mm23"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ONS - CPI ANNUAL RATE 00: ALL ITEMS 2015=100
                  </a>
                </div>
              </li>

              <li>
                Pay growth data sourced from the UK Office for National
                Statistics (ONS):
                <div className="mt-1 space-y-1">
                  <a
                    className="text-primary-600"
                    href="https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/realtimeinformationstatisticsreferencetablenonseasonallyadjusted"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Earnings and employment from Pay As You Earn Real Time
                    Information, non-seasonally adjusted [27. Median of Pay
                    Growth (UK)]
                  </a>
                  <br />
                  <strong>
                    Pay growth varies wildly depending on industry and your
                    specific job role.
                  </strong>
                </div>
              </li>

              <li>
                None of your salary information leaves your browser. If you
                choose to screenshot or download a copy of the page, then it
                only exists with you.
              </li>
              <li>
                This is not financial, tax, or employment advice. For important
                decisions, consult a qualified professional.
              </li>
            </ul>

            <p className="text-sm text-default-600">
              Data last updated on TODO DATE. Some figures take time to release
              and therefore may be out of date until the data sources used
              publish new versions.
            </p>
          </CardBody>
        </Card>

        <Divider />

        <div className="flex flex-col items-center text-sm text-default-500 text-center space-y-1">
          <a
            href="https://ko-fi.com/jack828"
            target="_blank"
            rel="noopener nofollow"
            className="text-blue-500 hover:text-blue-600 hover:underline"
          >
            <Image
              src="https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_blue.png"
              alt="Support me on Ko-fi"
              width={980 / 5}
              height={198 / 5}
            />
          </a>
          <span>
            <a href="https://jackburgess.dev">Jack Burgess</a> &copy;{' '}
            {new Date().getFullYear()}
          </span>
          <br />
          <span>Powered my tea, marmalade, and curiosity.</span>
          <br />
          <span className="font-mono">&lt;/website&gt;</span>
        </div>
      </div>
    </div>
  )
}
