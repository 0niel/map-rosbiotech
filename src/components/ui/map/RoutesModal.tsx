import React, { type FormEvent } from "react";
import { X } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import SearchInput, { type SearchResult } from "../SearchInput";

interface RoutesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (start: string, end: string) => void;
  aviableRooms: string[];
}

const RoutesModal: React.FC<RoutesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  aviableRooms,
}) => {
  const [start, setStart] = useState("");
  const [startSearchResults, setStartSearchResults] = useState<SearchResult[]>(
    [],
  );
  const [end, setEnd] = useState("");
  const [endSearchResults, setEndSearchResults] = useState<SearchResult[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!start || !end) {
      return;
    }

    onSubmit(start, end);
  };

  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={cancelButtonRef}
      >
        <Transition.Child
          as={Fragment}
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <button
                  type="button"
                  className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                  onClick={onClose}
                >
                  <X size={20} />
                  <span className="sr-only">Закрыть окно</span>
                </button>
                <div className="space-y-6 px-6 py-6 lg:px-8">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-900"
                    >
                      Начальная точка
                    </label>
                    <SearchInput
                      onSubmit={setStart}
                      showSubmitButton={false}
                      onChange={(data) => {
                        const filtred = aviableRooms.filter((room) =>
                          room
                            .toLowerCase()
                            .trim()
                            .includes(data.toLowerCase().trim()),
                        );
                        setStartSearchResults(
                          filtred.map((room) => ({ title: room, id: room })),
                        );
                      }}
                      searchResults={startSearchResults}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-gray-900"
                    >
                      Конечная точка
                    </label>
                    <SearchInput
                      onSubmit={setEnd}
                      showSubmitButton={false}
                      onChange={(data) => {
                        const filtred = aviableRooms.filter((room) =>
                          room
                            .toLowerCase()
                            .trim()
                            .includes(data.toLowerCase().trim()),
                        );
                        setEndSearchResults(
                          filtred.map((room) => ({ title: room, id: room })),
                        );
                      }}
                      searchResults={endSearchResults}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                    onClick={handleSubmit}
                  >
                    Построить
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default RoutesModal;
