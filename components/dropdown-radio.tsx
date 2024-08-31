'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ChevronDown } from 'lucide-react'
import React, { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { Button } from './ui/button'

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
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button>
            {title}

            <ChevronDown
              className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="p-3 text-sm">
          <DropdownMenuLabel>Выберите кампус</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <RadioGroup
            value={selectedOption?.id}
            onValueChange={id => {
              const option = options.find(option => option.id === id)
              if (option) {
                handleOptionClick(option)
              }
            }}
            className="space-y-1"
            aria-labelledby="dropdownRadioHelperButton"
          >
            {options.map(option => (
              <DropdownMenuItem
                key={option.id}
                className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-100"
                onSelect={() => handleOptionClick(option)}
              >
                <RadioGroupItem
                  value={option.id}
                  id={`helper-radio-${option.id}`}
                />
                <Label
                  htmlFor={`helper-radio-${option.id}`}
                  className="flex flex-col"
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  <span className="text-xs font-normal text-gray-500">
                    {option.description}
                  </span>
                </Label>
              </DropdownMenuItem>
            ))}
          </RadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default DropdownRadio
