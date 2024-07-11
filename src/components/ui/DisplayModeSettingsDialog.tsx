import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import DateAndTimePicker from './DateAndTimePicker'
import { useDisplayModeStore } from '~/lib/stores/displayModeStore'

interface DisplayModeSettingsDialogProps {
    isOpen: boolean
    onClose: () => void
}

const DisplayModeSettingsDialog: React.FC<DisplayModeSettingsDialogProps> = ({
    isOpen,
    onClose
}) => {
    const { timeToDisplay, setTimeToDisplay } = useDisplayModeStore()

    const mainButtonRef = React.useRef(null)

    const [showDateTimePicker, setShowDateTimePicker] = React.useState(false)
    const [selectedDateTime, setSelectedDateTime] =
        React.useState<Date>(timeToDisplay)

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog
                open={isOpen}
                onClose={onClose}
                className="fixed inset-0 z-50 overflow-y-auto"
                initialFocus={mainButtonRef}
            >
                <Transition.Child
                    as="div"
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 z-40 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
                        <Transition.Child
                            as="div"
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Title as="h3" className="sr-only">
                                Настройки отображения
                            </Dialog.Title>
                            <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <button
                                    type="button"
                                    className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                                    onClick={onClose}
                                >
                                    <X size={20} />
                                    <span className="sr-only">
                                        Закрыть окно
                                    </span>
                                </button>
                                <div className="space-y-6 px-6 py-6 lg:px-8">
                                    <p>
                                        Выберите дату и время, для которых будет
                                        отображена карта:
                                    </p>
                                    <div className="flex space-x-4">
                                        <DateAndTimePicker
                                            selectedDateTime={selectedDateTime}
                                            setSelectedDateTime={newDate => {
                                                setSelectedDateTime(newDate)
                                            }}
                                            dateTimePickerShow={
                                                showDateTimePicker
                                            }
                                            setDateTimePickerShow={
                                                setShowDateTimePicker
                                            }
                                        />
                                    </div>
                                    <button
                                        ref={mainButtonRef}
                                        type="submit"
                                        className="w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white  focus:outline-none focus:ring-4 bg-green-500 hover:bg-green-600 focus:ring-green-300"
                                        onClick={() => {
                                            setTimeToDisplay(selectedDateTime)
                                            onClose()
                                        }}
                                    >
                                        Применить
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}

export default DisplayModeSettingsDialog
