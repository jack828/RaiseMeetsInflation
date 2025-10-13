import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

export const Advert = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  return (
    <div className="flex flex-col rounded-large transition-transform-background border-dashed border-2 p-6 text-center text-current">
      <p className="text-sm">
        I’d have “loved” to place an ad here - gotta pay the bills somehow -
      </p>
      <p className="text-sm">
        but AdSense won’t verify me, and other companies are dodgy at best.
      </p>
      <p className="text-sm">So you get it free.</p>
      <p className="text-sm">
        <a
          href="https://ko-fi.com/jack828"
          target="_blank"
          rel="noopener nofollow"
          className="text-blue-500 hover:text-blue-600 hover:underline"
        >
          Consider supporting me on Ko-fi instead{' '}
          <ArrowTopRightOnSquareIcon className="size-4 inline" />
        </a>
      </p>
    </div>
  )
}
