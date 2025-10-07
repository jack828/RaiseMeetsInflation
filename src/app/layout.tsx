import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Roboto, Roboto_Mono } from 'next/font/google'
import { clsx } from 'clsx'
import './globals.css'
import { Providers } from '@/providers'
import NavigationBar from '@/components/navbar'

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
    'admaven-placement': 'Bqja7rHwG'
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
        <GoogleAnalytics gaId="G-C90M5EB5BS" />
        <Providers>
          <NavigationBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
