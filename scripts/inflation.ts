import {
  parse,
  format,
  startOfMonth,
  add,
  isAfter,
  parseISO,
  sub
} from 'date-fns'
import * as csv from 'csv-parse/sync'
import * as XLSX from 'xlsx'
import * as cheerio from 'cheerio'
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
  // console.log(Object.keys(datasets))
  // console.log(datasets.items.filter(i => JSON.stringify(i).toLowerCase().includes('consumerpriceinflation')))

  const metadataFile = path.join(__dirname, '../src/data/metadata.json')
  const metadata = await fs
    .readFile(metadataFile, 'utf8')
    .then((d) => JSON.parse(d))

  const onsInflationPage = await fetch(
    'https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceinflation'
  ).then((res) => res.text())
  const $ = cheerio.load(onsInflationPage)

  const lastUpdatedDateEl = $(
    // @ts-expect-error
    $('div.meta__term')
      .toArray()
      .find((el) => $(el).text().includes('Release')).next.next
  )
  console.log({ lastUpdatedDateEl })
  const lastUpdatedDate = sub(
    parse(lastUpdatedDateEl.text(), 'd MMMM yyyy', new Date()),
    {
      minutes: new Date().getTimezoneOffset()
    }
  )
  console.log({ lastUpdatedDate })
  const downloadButton = $('a[aria-label^="Download"]')
  console.log(downloadButton)

  if (!isAfter(lastUpdatedDate, parseISO(metadata.inflation.lastUpdated))) {
    console.log(
      `Remote dataset not newer than the one recorded (local: ${metadata.inflation.lastUpdated}, remote: ${lastUpdatedDate.toISOString()}), exiting...`
    )
    return
  }

  const latestDatasetUrl =
    'https://www.ons.gov.uk' + downloadButton.attr('href')
  console.log({ latestDatasetUrl })

  const raw = await fetch(latestDatasetUrl).then((res) => res.arrayBuffer())
  const workbook = XLSX.read(raw)

  // CPIH: Detailed indices to 3 dp: 1988 to 2026
  const sheetIndex = workbook.SheetNames.findIndex((n) => n === 'Table 37')
  console.log(workbook.SheetNames[sheetIndex])
  const sheet = workbook.Sheets[workbook.SheetNames[sheetIndex]]

  const rows: string[] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null
  })

  const headerIndex = rows.findIndex(
    ([a, b]) => a?.trim() === 'index date' && b?.trim() === 'name'
  )

  // console.log(rows)
  const parsedRows = rows.slice(headerIndex + 1).map(
    ([indexDate, rawDate, value]) => {
      console.log({ indexDate, rawDate, value })
      if (!indexDate || !rawDate || !value) {
        return null
      }
      const parsed = parse(String(indexDate), 'yyyyMM', new Date())

      // fucking timezones
      const date = add(startOfMonth(parsed), {
        days: 1
      })
      const key = monthKey(date.toISOString())
      return {
        date,
        key,
        value: Number(value)
      }
    },
    {} as Record<string, string | number>
  )

  console.log('Total rows', parsedRows.length)
  const convertedRows = parsedRows.reduce(
    (acc, r, i) => {
      if (!r) {
        return acc
      }
      const yearAgo = parsedRows[i - 12]
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

  // console.log(convertedRows)

  await fs.writeFile(
    path.join(__dirname, '../src/data/inflation.json'),
    JSON.stringify(convertedRows, null, 2)
  )

  metadata.inflation.lastUpdated = lastUpdatedDate.toISOString()
  await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2))
  process.exit()
  /*
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

  console.log(latestDataset)
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
*/
})()
