import React from 'react'
import Datepicker from 'tailwind-datepicker-react'

interface DateAndTimePickerProps {
  dateTimePickerShow: boolean
  setDateTimePickerShow: (show: boolean) => void
  selectedDateTime: Date
  setSelectedDateTime: (date: Date) => void
}

const DateAndTimePicker: React.FC<DateAndTimePickerProps> = ({
  dateTimePickerShow,
  setDateTimePickerShow,
  selectedDateTime,
  setSelectedDateTime
}) => {
  const [value, setValue] = React.useState('')

  React.useEffect(() => {
    setValue(`${selectedDateTime.getHours()}:${selectedDateTime.getMinutes()}`)
  }, [selectedDateTime])

  return (
    <div className="flex w-full max-w-xl flex-row space-x-4">
      <Datepicker
        options={{
          datepickerClassNames: 'z-50 ',
          theme: {
            background: '',
            todayBtn: '',
            clearBtn: '',
            icons: '',
            text: '',
            disabledText: '',
            input: 'cursor-pointer',
            inputIcon: 'cursor-pointer',
            selected: ''
          },

          weekDays: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],

          language: 'ru',
          dateFormat: 'dd.mm.yyyy',

          autoHide: true,
          todayBtn: false,
          clearBtn: false
        }}
        show={dateTimePickerShow}
        setShow={setDateTimePickerShow}
        selected={selectedDateTime}
        onChange={(date: Date) => {
          if (date) {
            setSelectedDateTime(date)
          }
        }}
      />

      <label htmlFor="time" className="text-sm text-gray-900">
        <input
          type="time"
          className="сursor-pointer w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          min="08:00"
          max="20:00"
          step="900"
          value={value}
          id="time"
          onChange={e => {
            setValue(e.target.value)
            const [hours, minutes] = e.target.value.split(':')

            let date = new Date()
            if (selectedDateTime) {
              date = selectedDateTime
            }

            date.setHours(Number(hours))
            date.setMinutes(Number(minutes))
            setSelectedDateTime(date)
          }}
        />
      </label>
    </div>
  )
}

export default DateAndTimePicker
