import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuViewport
} from '@/components/ui/navigation-menu'
import { cva } from 'class-variance-authority'

type DropdownRadioOption = {
  id: string
  label: string
  description: string
}

type DropdownRadioProps = {
  title: string
  options: DropdownRadioOption[]
  onSelectionChange: (selectedOption: DropdownRadioOption | null) => void
  defaultSelectedOptionId?: string
}

const DropdownRadio: React.FC<DropdownRadioProps> = ({
  title,
  options,
  onSelectionChange,
  defaultSelectedOptionId
}) => {
  const [selectedOption, setSelectedOption] =
    useState<DropdownRadioOption | null>(
      options.find(option => option.id === defaultSelectedOptionId) || null
    )

  const handleOptionClick = (option: DropdownRadioOption) => {
    setSelectedOption(option)
    onSelectionChange(option)
  }

  useHotkeys('left', () => {
    if (selectedOption) {
      const newOption = options.at(
        options.map(option => option.id).indexOf(selectedOption.id) - 1
      )
      if (newOption !== undefined) {
        handleOptionClick(newOption)
      }
    }
  })

  useHotkeys('right', () => {
    if (selectedOption) {
      const newOption = options.at(
        (options.map(option => option.id).indexOf(selectedOption.id) + 1) %
          options.length
      )
      if (newOption !== undefined) {
        handleOptionClick(newOption)
      }
    }
  })

  const navigationMenuTriggerStyle = cva(
    'group inline-flex h-10 w-max items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium transition-colors hover:bg-primary hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-primary/50'
  )

  return (
    <div className="pointer-events-auto">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
              {title}
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              <ul
                className="space-y-1 p-3 text-sm text-gray-700"
                aria-labelledby="dropdownRadioHelperButton"
              >
                {options.map(option => (
                  <li key={option.id}>
                    <div
                      className="flex rounded p-2 hover:bg-gray-100"
                      onClick={() => handleOptionClick(option)}
                    >
                      <div className="flex h-5 items-center">
                        <input
                          id={`helper-radio-${option.id}`}
                          name="helper-radio"
                          type="radio"
                          value=""
                          checked={selectedOption?.id === option.id}
                          readOnly
                          className="h-4 w-4 border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="ml-2 text-sm">
                        <label
                          htmlFor={`helper-radio-${option.id}`}
                          className="font-medium text-gray-900"
                        >
                          <div className="text-sm font-medium text-blue-500">
                            {option.label}
                          </div>
                          <p
                            id={`helper-radio-text-${option.id}`}
                            className="text-xs font-normal text-gray-500"
                          >
                            {option.description}
                          </p>
                        </label>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default DropdownRadio
