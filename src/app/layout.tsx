import type { Metadata } from 'next'
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
  metadataBase: new URL('https://raisemeetsinflation.jack.tf'),
  openGraph: {
    type: 'website'
  },
  robots: {
    index: true,
    follow: true,
    nocache: false
  },
  verification: {
    // TODO
    // google: 'google'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={clsx('antialiased', roboto.variable, robotoMono.variable)}
      >
        <Providers>
          <NavigationBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
