'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Switch
} from '@heroui/react'
import { useTheme } from 'next-themes'

export default function NavigationBar() {
  const { theme, systemTheme, setTheme } = useTheme()
  const current = theme === 'system' ? systemTheme : theme
  return (
    <Navbar isBordered className="shadow-sm">
      <NavbarBrand>
        <p className="text-xl font-bold">Raise Meets Inflation</p>
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
