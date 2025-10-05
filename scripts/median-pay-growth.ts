import * as cheerio from 'cheerio'
import * as XLSX from 'xlsx'
import { parse, format, add, sub, isAfter, parseISO } from 'date-fns'
import path from 'node:path'
import fs from 'node:fs/promises'
;(async () => {
  console.log('Getting pay growth stats...')

  const metadataFile = path.join(__dirname, '../src/data/metadata.json')
  const metadata = await fs
    .readFile(metadataFile, 'utf8')
    .then((d) => JSON.parse(d))

  const onsPayGrowthPage = await fetch(
    'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/realtimeinformationstatisticsreferencetableseasonallyadjusted/current'
  ).then((res) => res.text())
  const $ = cheerio.load(onsPayGrowthPage)

  const $table = $('table')
  if ($table.length !== 1) {
    throw new Error('Incorrect number of tables found!')
  }
  const $lastDataset = $table.find('tbody tr:first-child')
  const lastUpdated = $table.find($lastDataset.children()[2]).text()
  const lastUpdatedDate = sub(
    parse(lastUpdated, 'd MMMM yyyy HH:mm', new Date()),
    {
      minutes: new Date().getTimezoneOffset()
    }
  )
  console.log(lastUpdated, lastUpdatedDate)

  if (!isAfter(lastUpdatedDate, parseISO(metadata.payGrowth.lastUpdated))) {
    console.log(
      `Remote dataset not newer than the one recorded (local: ${metadata.payGrowth.lastUpdated}, remote: ${lastUpdatedDate.toISOString()}), exiting...`
    )
    // return
  }

  console.log('Updating dataset')

  const latestDatasetUrl =
    'https://www.ons.gov.uk' +
    $('a.btn.btn--primary[data-gtm-download-type=xlsx]').first().attr('href')
  console.log({ latestDatasetUrl })

  const raw = await fetch(latestDatasetUrl).then((res) => res.arrayBuffer())
  // const raw = await fs.readFile('/home/jack/Downloads/rtinsasep2025.xlsx')

  const workbook = XLSX.read(raw)

  const sheet = workbook.Sheets[workbook.SheetNames[27]]

  const rows: string[] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null
  })

  const headerIndex = rows.findIndex(
    ([a, b]) => a === 'Date' && b === 'Median of pay growth'
  )
  const data = rows.slice(headerIndex + 1).reduce(
    (acc, [date, value]) => {
      const key = format(parse(date, 'MMMM yyyy', new Date()), 'yyyy-MM')
      acc[key] = {
        date: key,
        value: Number((Number(value) * 100).toFixed(2))
      }
      return acc
    },
    {} as Record<string, object>
  )

  console.log(data)

  await fs.writeFile(
    path.join(__dirname, '../src/data/median-pay-growth.json'),
    JSON.stringify(data, null, 2)
  )

  metadata.payGrowth.lastUpdated = lastUpdatedDate.toISOString()
  await fs.writeFile(metadataFile, JSON.stringify(metadata, null, 2))
  console.log('done')
})()
