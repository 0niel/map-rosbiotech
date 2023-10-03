import React, { useState } from "react"
import { ChevronDown } from "lucide-react"
import { useHotkeys } from "react-hotkeys-hook"

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
  defaultSelectedOptionId,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState<DropdownRadioOption | null>(
    options.find((option) => option.id === defaultSelectedOptionId) || null,
  )

  const handleButtonClick = () => {
    setIsVisible(!isVisible)
  }

  const handleOptionClick = (option: DropdownRadioOption) => {
    setSelectedOption(option)
    onSelectionChange(option)
    setIsVisible(false)
  }

  useHotkeys("left", () => {
    if (selectedOption) {
      const newOption = options.at(options.map((option) => option.id).indexOf(selectedOption.id) - 1)
      if (newOption !== undefined) {
        handleOptionClick(newOption)
      }
    }
  })

  useHotkeys("right", () => {
    if (selectedOption) {
      const newOption = options.at((options.map((option) => option.id).indexOf(selectedOption.id) + 1) % options.length)
      if (newOption !== undefined) {
        handleOptionClick(newOption)
      }
    }
  })

  return (
    <div className="pointer-events-auto">
      <button
        id="dropdownRadioHelperButton"
        data-dropdown-toggle="dropdownRadioHelper"
        className="inline-flex items-center rounded-lg bg-blue-700 p-4 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        type="button"
        onClick={handleButtonClick}
      >
        {title}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      <div
        id="dropdownRadioHelper"
        className={`absolute right-0 top-0 z-10 mt-12 ${
          isVisible ? "fixed" : "hidden"
        } w-60 divide-y divide-gray-100 rounded-lg bg-white shadow`}
      >
        <ul className="space-y-1 p-3 text-sm text-gray-700" aria-labelledby="dropdownRadioHelperButton">
          {options.map((option) => (
            <li key={option.id}>
              <div className="flex rounded p-2 hover:bg-gray-100" onClick={() => handleOptionClick(option)}>
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
                  <label htmlFor={`helper-radio-${option.id}`} className="font-medium text-gray-900">
                    <div className="text-sm font-medium text-blue-500">{option.label}</div>
                    <p id={`helper-radio-text-${option.id}`} className="text-xs font-normal text-gray-500">
                      {option.description}
                    </p>
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default DropdownRadio
