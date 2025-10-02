import { parse, format, startOfMonth, add, isAfter, parseISO } from 'date-fns'
import * as csv from 'csv-parse/sync'
import path from 'node:path'
import fs from 'node:fs/promises'
import { monthKey, pctDifference } from '@/lib'
import { InflationDataEntry } from '@/datasets'

// const getPage = (page: number, limit: number) =>
//   fetch(
//     `https://api.beta.ons.gov.uk/v1/datasets?offset=${(page - 1) * limit}&limit=${limit}`
//   ).then((r) => r.json())
;(async () => {
  // const datasets = await getPage(1, 1000)
  // console.log(datasets)

  const metadataFile = path.join(__dirname, '../src/data/metadata.json')
  const metadata = await fs
    .readFile(metadataFile, 'utf8')
    .then((d) => JSON.parse(d))

  const inflationDataset = await fetch(
    'https://api.beta.ons.gov.uk/v1/datasets/cpih01'
  ).then((r) => r.json())

  console.log('Got dataset:', inflationDataset)

  const latestHref = inflationDataset.links.latest_version.href
  console.log({ latestHref })

  const latestDataset = await fetch(latestHref).then((r) => r.json())
  console.log('Got dataset')

  if (
    !isAfter(
      parseISO(latestDataset.last_updated),
      parseISO(metadata.inflation.lastUpdated)
    )
  ) {
    console.log('Remote dataset not newer than the one recorded, exiting...')
    return
  }

  console.log('Updating dataset...')

  const datasetCsvHref = latestDataset.downloads.csv.href
  console.log('Dataset CSV', datasetCsvHref)

  const csvRaw = await fetch(datasetCsvHref).then((r) => r.text())

  type CSVRow = {
    v4_0: string
    'mmm-yy': string
    Time: string
    'uk-only': string
    Geography: string
    cpih1dim1aggid: string
    Aggregate: string
  }
  const records = csv.parse<CSVRow>(csvRaw, {
    columns: true,
    skip_empty_lines: true
  })
  const cp00Only = records.filter((r) => r['cpih1dim1aggid'] === 'CP00')
  const parsedRows = cp00Only.map((r) => {
    // fucking timezones
    const date = add(startOfMonth(parse(r['mmm-yy'], 'MMM-yy', new Date())), {
      days: 1
    })
    return {
      value: Number(r['v4_0']),
      date,
      key: monthKey(date.toISOString())
    }
  })
  console.log('Total CP00 Rows', cp00Only.length)

  const convertedRows = parsedRows.reduce(
    (acc, r, i) => {
      const yearAgo = parsedRows[i + 12]
      if (!yearAgo) {
        return acc
      }
      acc[r.key] = {
        value: Number(pctDifference(r.value, yearAgo.value).toFixed(2)),
        date: r.key
      }
      return acc
    },
    {} as Record<InflationDataEntry, object>
  )
  console.log('Converted to metrics', Object.keys(convertedRows).length)

  await fs.writeFile(
    path.join(__dirname, '../src/data/inflation.json'),
    JSON.stringify(convertedRows, null, 2)
  )

  metadata.inflation.lastUpdated = latestDataset.last_updated
  await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2))
})()
