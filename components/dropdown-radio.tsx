import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport
} from '@/components/ui/navigation-menu'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cva } from 'class-variance-authority'
import { ChevronDown } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

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

  return (
    <div className="pointer-events-auto">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className="bg-primary text-white hover:bg-primary/80 hover:text-gray-100
             focus:bg-primary/80 focus:text-white data-[active]:bg-primary/80 data-[state=open]:bg-primary/80"
            >
              {title}
            </NavigationMenuTrigger>

            <NavigationMenuContent>
              <RadioGroup
                value={selectedOption?.id}
                onValueChange={id => {
                  const option = options.find(option => option.id === id)
                  if (option) {
                    handleOptionClick(option)
                  }
                }}
                className="space-y-1 p-3 text-sm text-gray-700"
                aria-labelledby="dropdownRadioHelperButton"
              >
                {options.map(option => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100"
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={`helper-radio-${option.id}`}
                    />
                    <Label
                      htmlFor={`helper-radio-${option.id}`}
                      className="flex flex-col"
                    >
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="text-xs font-normal text-gray-500">
                        {option.description}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default DropdownRadio
