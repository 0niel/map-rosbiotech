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
import RoomInfoTabContent from "./RoomInfoTabContent";
import DateAndTimePicker from "./DateAndTimePicker";
import { RoomOnMap } from "~/lib/map/RoomOnMap";
import {
  fillRoom,
  getRoomNameByElement,
  searchRoomsByName,
} from "~/lib/map/roomHelpers";
import { searchInMapAndGraph } from "~/lib/map/searchInMapInGraph";
import MapControls from "./MapControls";

const scheduleAPI = new ScheduleAPI();

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

  const [selectedRoomOnMap, setSelectedRoomOnMap] = useState<RoomOnMap | null>(
    null
  );
  const selectedRoomRef = useRef<RoomOnMap | null>(null);

  const handleRoomClick = (e: Event) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const room = target.closest("[data-room]");

    if (!room) {
      return;
    }

    if (selectedRoomRef.current && selectedRoomRef.current.baseElement) {
      selectedRoomRef.current.element.replaceWith(
        selectedRoomRef.current.baseElement
      );
    }

    if (room === selectedRoomRef.current?.element) {
      return;
    }

    const base = room.cloneNode(true);
    base.addEventListener("click", handleRoomClick);
    (room as HTMLElement).style.cursor = "pointer";
    const baseState = base as Element;

    fillRoom(room, "#2563EB");

    const name = getRoomNameByElement(room);
    if (!name) {
      return;
    }

    setSelectedRoomOnMap({
      element: room,
      baseElement: baseState,
      name: name,
      remote: null,
    });

    setDrawerOpened(true);
  };

  useEffect(() => {
    selectedRoomRef.current = selectedRoomOnMap;
  }, [selectedRoomOnMap]);

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
    const results = searchInMapAndGraph(data, graph);
    setSearchResults(results);
  };

  const [dateTimePickerShow, setDateTimePickerShow] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());

  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full flex-row items-start border-b border-gray-200 px-4 py-2">
        <DateAndTimePicker
          dateTimePickerShow={dateTimePickerShow}
          setDateTimePickerShow={setDateTimePickerShow}
          selectedDateTime={selectedDateTime}
          setSelectedDateTime={setSelectedDateTime}
        />
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
              Аудитория{" "}
              {selectedRoomOnMap != null
                ? selectedRoomOnMap.name
                : "не выбрана"}
            </h5>
          }
        >
          <div className="p-4">
            <Tabs>
              <Tabs.Tab name="Информация" icon={<Info />}>
                <RoomInfoTabContent dateTime={selectedDateTime} room={null} />
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

            <MapControls
              onZoomIn={() => transformComponentRef.current?.zoomIn()}
              onZoomOut={() => transformComponentRef.current?.zoomOut()}
              floors={[1, 2, 3, 4]}
              selectedFloor={selectedFloor}
              setSelectedFloor={setSelectedFloor}
            />

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
