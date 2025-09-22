import {
  ArrowLongRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

export const trendIcon = (v: number) =>
  v === 0 ? (
    <ArrowLongRightIcon />
  ) : v > 0 ? (
    <ArrowTrendingUpIcon className="text-success-700 dark:text-success" />
  ) : (
    <ArrowTrendingDownIcon className="text-danger-600 dark:text-danger-500" />
  )
