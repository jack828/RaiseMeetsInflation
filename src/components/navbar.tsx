'use client'

import { useEffect, useState } from 'react'
import { Raleway } from 'next/font/google'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Switch
} from '@heroui/react'
import { useTheme } from 'next-themes'
import { clsx } from 'clsx'
import { LogoSvg } from './logo-svg'
import Link from 'next/link'

const raleway = Raleway({
  subsets: ['latin']
})

export default function NavigationBar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <Navbar isBordered className="shadow-sm">
      <Link href="/">
        <NavbarBrand>
          <LogoSvg width={32} height={32} />
          <p
            className={clsx(
              'ml-2 text-2xl sm:text-3xl font-bold',
              raleway.className
            )}
          >
            Raise Meets Inflation
          </p>
        </NavbarBrand>
      </Link>

      <NavbarContent justify="end">
        <NavbarItem>
          {mounted && (
            <Switch
              isSelected={resolvedTheme === 'dark'}
              onValueChange={(isSelected) =>
                setTheme(isSelected ? 'dark' : 'light')
              }
              size="lg"
              startContent={<SunIcon />}
              endContent={<MoonIcon />}
            />
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
