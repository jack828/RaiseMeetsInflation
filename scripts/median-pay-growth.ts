import * as XLSX from 'xlsx'
import { parse, format } from 'date-fns'
import path from 'node:path'
import fs from 'node:fs/promises'

const raw = await fs.readFile('/home/jack/Downloads/rtinsasep2025.xlsx')

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
      value: Number(value) * 100
    }
    return acc
  },
  {} as Record<string, object>
)

console.log(data)

await fs.writeFile(
  path.join(import.meta.dirname, '../src/data/median-pay-growth.json'),
  JSON.stringify(data, null, 2)
)

