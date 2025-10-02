import inflationData from '@/data/inflation.json' assert { type: 'json' }
import payGrowthData from '@/data/median-pay-growth.json' assert { type: 'json' }
import metadata from '@/data/metadata.json' assert { type: 'json' }

export { metadata }

export type InflationDataEntry = keyof typeof inflationData

export type PayGrowthDataEntry = keyof typeof payGrowthData

export const getInflationValue =
  (key: string) => {
    const inflationEntry = inflationData[key as InflationDataEntry]
    const inflationValue = inflationEntry?.value || 0
    if (inflationValue === 0) {
      console.warn('Missing inflation data for', key)
    }
    return inflationValue
  }

export const getPayGrowthValue = (key: string) => {
  const payGrowthEntry = payGrowthData[key as PayGrowthDataEntry]

  const payGrowthValue = payGrowthEntry?.value || 0
  if (payGrowthValue === 0) {
    console.warn('Missing pay growth data for', key)
  }
  return payGrowthValue
}
