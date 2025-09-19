'use client'

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Switch
} from '@heroui/react'
import { useTheme } from 'next-themes'

export default function NavigationBar() {
  const { theme, setTheme } = useTheme()

  return (
    <Navbar isBordered className="shadow-sm">
      <NavbarBrand>
        <p className="text-xl font-bold text-white bg-clip-text text-transparent">
          Raise Meets Inflation
        </p>
      </NavbarBrand>

      <NavbarContent justify="end">
        <NavbarItem>
          <Switch
            isSelected={theme === 'dark'}
            onValueChange={(isSelected) =>
              setTheme(isSelected ? 'dark' : 'light')
            }
            size="lg"
            startContent={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
            endContent={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            }
          />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}
