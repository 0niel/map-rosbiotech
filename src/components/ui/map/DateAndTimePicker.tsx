import React, { use } from "react";
import Datepicker from "tailwind-datepicker-react";

interface DateAndTimePickerProps {
  dateTimePickerShow: boolean;
  setDateTimePickerShow: (show: boolean) => void;
  selectedDateTime: Date;
  setSelectedDateTime: (date: Date) => void;
}

const DateAndTimePicker: React.FC<DateAndTimePickerProps> = ({
  dateTimePickerShow,
  setDateTimePickerShow,
  selectedDateTime,
  setSelectedDateTime,
}) => {
  return (
    <div className="flex w-full max-w-xl flex-row space-x-4">
      <Datepicker
        options={{
          language: "ru",
          dateFormat: "dd.mm.yyyy",

          autoHide: true,
          todayBtn: false,
          clearBtn: false,
        }}
        show={dateTimePickerShow}
        setShow={setDateTimePickerShow}
        selected={selectedDateTime}
        onChange={(date: Date) => {
          if (date) {
            setSelectedDateTime(date);
          }
        }}
      />
      <label htmlFor="time" className="text-sm text-gray-900">
        <input
          type="time"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          min="08:00"
          max="20:00"
          step="900"
          value={selectedDateTime?.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
          id="time"
          onChange={(e) => {
            e.preventDefault();
            const [hours, minutes] = e.target.value.split(":");

            let date = new Date();
            if (selectedDateTime) {
              date = selectedDateTime;
            }

            date.setHours(Number(hours));
            date.setMinutes(Number(minutes));
            setSelectedDateTime(date);
          }}
        />
      </label>
    </div>
  );
};

export default DateAndTimePicker;
