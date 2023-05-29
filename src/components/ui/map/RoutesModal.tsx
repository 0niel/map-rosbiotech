import React, { FormEvent, useState } from "react";
import { X } from "lucide-react";
import SearchInput, { SearchResult } from "../SearchInput";

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
    []
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

  return (
    <div
      id="routes-modal"
      className={`fixed inset-0 z-10 overflow-y-auto ${
        isOpen ? "block" : "hidden"
      }`}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center">
        <div className="relative rounded-lg bg-white shadow">
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
                      .includes(data.toLowerCase().trim())
                  );
                  setStartSearchResults(
                    filtred.map((room) => ({ title: room, id: room }))
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
                      .includes(data.toLowerCase().trim())
                  );
                  setEndSearchResults(
                    filtred.map((room) => ({ title: room, id: room }))
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
        </div>
      </div>
    </div>
  );
};

export default RoutesModal;
