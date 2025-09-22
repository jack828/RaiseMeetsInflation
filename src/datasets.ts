import inflationData from '@/data/inflation-uk.json' assert { type: 'json' }
/*TODO FIXME some dates missing or inaccurate.
 parsed = raw
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split(',').map((c) => c.replaceAll('"', '')))
  .slice(1)
  .map((r) => ({
    date: new Date(`01 ${r[0]}`).toISOString().slice(0, 7),
    cpih: Number(r[1]),
    cpi: Number(r[2])
  }))
  .reduce((acc, d) => ({ [d.date]: d, ...acc }), {}) */
import payGrowthData from '@/data/median-pay-growth.json' assert { type: 'json' }
import { InflationType } from './app/page'

export type InflationDataEntry = keyof typeof inflationData

export type PayGrowthDataEntry = keyof typeof payGrowthData

export const getInflationValue =
  (type: InflationType = 'cpih') =>
  (key: string) => {
    const inflationEntry = inflationData[key as InflationDataEntry]
    const inflationTypeValue = inflationEntry?.[type] || 0
    if (inflationTypeValue === 0) {
      console.warn('Missing inflation data for', key)
    }
    return inflationTypeValue
  }

export const getPayGrowthValue = (key: string) => {
  const payGrowthEntry = payGrowthData[key as PayGrowthDataEntry]

  const payGrowthValue = payGrowthEntry?.value || 0
  if (payGrowthValue === 0) {
    console.warn('Missing pay growth data for', key)
  }
  return payGrowthValue
}
