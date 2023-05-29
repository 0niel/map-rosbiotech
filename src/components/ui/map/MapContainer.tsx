import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import Floor2 from "~/components/svg/floor_2.svg";
import FloorSelectorButtons from "./FloorSelectorButtons";
import { useEffect, useRef, useState } from "react";
import SearchInput, { type SearchResult } from "../SearchInput";
import ScaleButtons from "./ScaleButtons";
import RightDrawer from "../RightDrawer";
import { Info } from "lucide-react";
import Tabs from "../Tabs";
import { BadgeInfo, Calendar } from "lucide-react";
import DropdownRadio from "../DropdownRadio";
import routesJson from "public/routes.json";
import { type Graph, searchNodesByLabel } from "~/lib/graph";
import MapRoute, { type MapRouteRef } from "./MapRoute";
import ScheduleAPI from "~/lib/schedule/api";
import { useQuery } from "react-query";
import { Spinner } from "flowbite-react";
import Datepicker from "tailwind-datepicker-react";
import RoomInfoTabContent from "./RoomInfoTabContent";

const scheduleAPI = new ScheduleAPI();

const fillRoom = (room: Element, color: string) => {
  const rect = room.querySelector("rect");
  if (rect) {
    rect.style.fill = color;
  }
};

const campuses = [
  {
    label: "В-78",
    description: "Проспект Вернадского, 78",
  },
  {
    label: "В-86",
    description: "Проспект Вернадского, 86",
  },
];

const loadJsonToGraph = (routesJson: string) => {
  const graph = JSON.parse(routesJson) as Graph;
  return graph;
};

const encodeRoomName = (roomName: string) => {
  const roomNameEncoded = roomName.replace(
    /\\u([0-9A-F]{4})/gi,
    (_, p1: string) => String.fromCharCode(parseInt(p1, 16))
  );
  return roomNameEncoded;
};

const getRoomNameByElement = (el: Element) => {
  const roomName = el.getAttribute("data-room");
  if (!roomName) {
    return null;
  }

  // Формат: "В-78__А-101", где "В-78" - кампус, "А-101" - номер комнаты

  return encodeRoomName(roomName).split("__")[1];
};

const searchRoomsByName = (name: string) => {
  const rooms = document.querySelectorAll("[data-room]");

  const foundRooms = [];

  for (const room of rooms) {
    const roomName = getRoomNameByElement(room);
    if (roomName?.trim().toLowerCase().includes(name.trim().toLowerCase())) {
      foundRooms.push(room);
    }
  }

  return foundRooms;
};

export const MapContainer = () => {
  const { isLoading, error, data } = useQuery({
    queryFn: async () => {
      const campuses = await scheduleAPI.getCampuses();

      const campusId = campuses.find(
        (campus) => campus.short_name === selectedCampus
      )?.id;

      if (!campusId) {
        return null;
      }

      const rooms = await scheduleAPI.getRooms(campusId);

      return rooms;
    },
  });

  const [graph, setGraph] = useState<Graph>(
    loadJsonToGraph(JSON.stringify(routesJson))
  );

  const mapRouteRef = useRef<MapRouteRef>(null);

  const [drawerOpened, setDrawerOpened] = useState(false);

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(3);
  const [selectedCampus, setSelectedCampus] = useState("В-78");

  // Текущая выбранная комната, после клика по ней и изменения атрибутов
  const [selectedRoom, setSelectedRoom] = useState<Element | null>(null);
  // Базовое состояние комнаты, которое восстанавливается после клика на другую комнату
  const [selectedRoomBaseState, setSelectedRoomBaseState] =
    useState<Element | null>(null);

  const selectedRoomRef = useRef<Element | null>(null);
  const selectedRoomBaseStateRef = useRef<Element | null>(null);

  const handleRoomClick = (e: Event) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const room = target.closest("[data-room]");

    if (!room) {
      return;
    }

    if (selectedRoomRef.current && selectedRoomBaseStateRef.current) {
      selectedRoomRef.current.replaceWith(selectedRoomBaseStateRef.current);
    }

    if (room !== selectedRoomRef.current) {
      const base = room.cloneNode(true);
      base.addEventListener("click", handleRoomClick);
      (room as HTMLElement).style.cursor = "pointer";
      setSelectedRoomBaseState(base as Element);
    }

    fillRoom(room, "#2563EB");
    setSelectedRoom(room);

    setDrawerOpened(true);
  };

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
    selectedRoomBaseStateRef.current = selectedRoomBaseState;
  }, [selectedRoom, selectedRoomBaseState]);

  useEffect(() => {
    if (!data || isLoading) {
      return;
    }

    const rooms = document.querySelectorAll("[data-room]");

    rooms.forEach((room) => {
      (room as HTMLElement).style.cursor = "pointer";
      room.addEventListener("click", handleRoomClick);
    });

    return () => {
      rooms.forEach((room) => {
        room.removeEventListener("click", handleRoomClick);
      });
    };
  }, [selectedFloor, data, isLoading]);

  const handleCloseDrawer = () => {
    setDrawerOpened(false);
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = (data: string) => {
    console.log(`Searching for ${data}`);
    if (data.length < 3) {
      return;
    }
    const roomsInGraph = searchNodesByLabel(graph, data);
    if (!roomsInGraph) {
      console.log(`Room ${data} not found in graph`);
      return [];
    }
    const rooms = searchRoomsByName(data);
    if (!rooms) {
      console.log(`Room ${data} not found in map`);
      return [];
    }

    const found = roomsInGraph.filter((room) => {
      const name = room.label;

      if (rooms.map((room) => getRoomNameByElement(room)).includes(name)) {
        return true;
      }

      return false;
    });

    const results = Array.from(found, (room, i) => ({
      id: i.toString(),
      title: room.label,
    }));

    console.log(`Found ${results.length} rooms`);

    setSearchResults(results);
  };

  const [dateTimePickerShow, setDateTimePickerShow] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());

  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full flex-row items-start border-b border-gray-200 px-4 py-2">
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
          />
          <label htmlFor="time" className="text-sm text-gray-900">
            <input
              type="time"
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              min="08:00"
              max="20:00"
              step="900"
              value={selectedDateTime?.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              id="time"
              onChange={(e) => {
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
      </div>

      <div className="h-full rounded-lg dark:border-gray-700">
        <RightDrawer
          isOpen={drawerOpened}
          onClose={handleCloseDrawer}
          titleComponent={
            <h5
              id="drawer-right-label"
              className="mb-4 inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400"
            >
              <Info className="mr-2 h-5 w-5" />
              Аудитория 301
            </h5>
          }
        >
          <div className="p-4">
            <Tabs>
              <Tabs.Tab name="Информация" icon={<Info />}>
                <RoomInfoTabContent dateTime={selectedDateTime} />
              </Tabs.Tab>
              <Tabs.Tab name="Расписание" icon={<Calendar />}>
                <div>2</div>
              </Tabs.Tab>
            </Tabs>
          </div>
        </RightDrawer>

        {isLoading && <Spinner />}
        {!isLoading && data && (
          <div className="relative z-0 mb-4 h-full w-full overflow-hidden">
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex flex-row items-center justify-between">
              <div className="z-20 mr-4 w-full sm:mx-auto sm:max-w-md md:mx-0 md:p-4">
                <SearchInput
                  onSubmit={(data) => console.log(data)}
                  onChange={handleSearch}
                  searchResults={searchResults}
                  placeholder="Аудитория или сотрудник"
                />
              </div>
              <div className="z-30 md:fixed md:right-10">
                <DropdownRadio
                  title={selectedCampus}
                  options={Array.from(campuses, (campus, i) => ({
                    label: campus.label,
                    description: campus.description,
                    id: i.toString(),
                  }))}
                  onSelectionChange={(selectedOption) => {
                    if (!selectedOption) {
                      return;
                    }
                    setSelectedCampus(selectedOption.label);
                  }}
                  defaultSelectedOptionId="0"
                />
              </div>
            </div>

            <div className="absolute bottom-12 right-2 z-20 md:right-12">
              <FloorSelectorButtons
                floors={[1, 2, 3, 4]}
                selectedFloor={selectedFloor}
                onFloorSelect={(floor) => setSelectedFloor(floor)}
              />
              <div className="mt-4">
                <ScaleButtons
                  onZoomIn={() => transformComponentRef.current?.zoomIn()}
                  onZoomOut={() => transformComponentRef.current?.zoomOut()}
                />
              </div>
            </div>

            <TransformWrapper
              minScale={0.05}
              initialScale={0.3}
              maxScale={1}
              panning={{ disabled: false }}
              wheel={{ disabled: false, step: 0.05 }}
              ref={transformComponentRef}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
              >
                <MapRoute
                  ref={mapRouteRef}
                  className="pointer-events-none absolute z-20 h-full w-full"
                  graph={graph}
                />

                <Floor2 />
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}
      </div>
    </div>
  );
};
