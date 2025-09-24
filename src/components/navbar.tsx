'use client'

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

const raleway = Raleway({
  subsets: ['latin']
})

export default function NavigationBar() {
  const { theme, systemTheme, setTheme } = useTheme()
  const current = theme === 'system' ? systemTheme : theme
  return (
    <Navbar isBordered className="shadow-sm">
      <NavbarBrand>
        <p className={clsx('text-3xl font-bold', raleway.className)}>
          Raise Meets Inflation
        </p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Switch
            isSelected={current === 'dark'}
            onValueChange={(isSelected) =>
              setTheme(isSelected ? 'dark' : 'light')
            }
            size="lg"
            startContent={<SunIcon />}
            endContent={<MoonIcon />}
          />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
