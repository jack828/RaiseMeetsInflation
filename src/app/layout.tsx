import type { Metadata } from 'next'
import { GoogleTagManager } from '@next/third-parties/google'
import { Roboto, Roboto_Mono } from 'next/font/google'
import { clsx } from 'clsx'
import './globals.css'
import { Providers } from '@/providers'
import NavigationBar from '@/components/navbar'
import { Divider } from '@heroui/react'
import { Footer } from '@/components/footer'

const roboto = Roboto({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

const robotoMono = Roboto_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: {
    template: '%s | Raise Meets Inflation',
    default: 'Raise Meets Inflation'
  },
  description: 'See how your pay matches up to inflation.',
  authors: [{ name: 'Jack Burgess', url: 'https://jackburgess.dev' }],
  creator: 'Jack Burgess',
  metadataBase: new URL('https://raisemeetsinflation.co.uk'),
  openGraph: {
    type: 'website'
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  },
  other: {
    'google-adsense-account': 'ca-pub-0383732125265907',
    'admaven-placement': 'Bqja7rHwG',
    monetag: '35074c7f10c728f991aaababf8d95aac'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={clsx('antialiased', roboto.variable, robotoMono.variable)}
      >
        <GoogleTagManager gtmId='GTM-M7MKKJPT'/>

        <Providers>
          <NavigationBar />
          <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6">
            {/*<div className="grid grid-cols-[1fr_minmax(0,56rem)_1fr] gap-6 items-start">
              <div className="order-1 hidden lg:flex justify-end">
                <div className="w-[160px] h-[300px]">
                  <Advert />
                </div>
              </div>

              <div className="order-3 hidden lg:flex justify-start">
                <div className="w-[160px]">right advert </div>
              </div> */}

            <main className="order-2 mx-auto w-full max-w-5xl">{children}</main>
            {/*</div>*/}

            <Divider className='my-6' />

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
