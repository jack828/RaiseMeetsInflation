import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

export const Advert = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }
  return (
    <div className="flex flex-col rounded-large transition-transform-background border-dashed border-3 p-10 text-center text-current">
      <p className="">Advert Placeholder</p>
      <p className="text-sm">gotta pay the bills somehow</p>
      <p className="text-sm">Don&apos;t like ads? Me neither.</p>
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
