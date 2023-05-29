import { useRouter } from "next/router";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import Floor2 from "~/components/svg/floor_2.svg";
import { useEffect, useRef, useState } from "react";
import SearchInput, { type SearchResult } from "../SearchInput";
import DropdownRadio from "../DropdownRadio";
import routesJson from "public/routes.json";
import { type Graph } from "~/lib/graph";
import MapRoute, { type MapRouteRef } from "./MapRoute";
import ScheduleAPI from "~/lib/schedule/api";
import { useQuery } from "react-query";
import { Spinner } from "flowbite-react";
import DateAndTimePicker from "./DateAndTimePicker";
import { MapPin } from "lucide-react";
import { type RoomOnMap } from "~/lib/map/RoomOnMap";
import {
  fillRoom,
  getRoomNameByElement,
  searchRoomsByName,
} from "~/lib/map/roomHelpers";
import { searchInMapAndGraph } from "~/lib/map/searchInMapInGraph";
import MapControls from "./MapControls";
import { type components } from "~/lib/schedule/schema";
import RoomDrawer from "./RoomDrawer";
import { useMutation } from "react-query";
import RoutesModal from "./RoutesModal";

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

const MapContainer = () => {
  const router = useRouter();

  const { isLoading, error, data } = useQuery(["rooms"], {
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
    onError: (error) => {
      console.error(error);
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

  useEffect(() => {
    if (!isLoading && transformComponentRef.current) {
      if (!router.query.room) {
        return;
      }

      const room = searchRoomsByName(router.query.room as string)[0] as Element;
      if (room) {
        selectRoomEl(room);
      }
    }
  }, [isLoading, transformComponentRef.current]);

  const selectRoomEl = (room: Element) => {
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

    if (!data) {
      return;
    }

    transformComponentRef.current?.zoomToElement(room as HTMLElement);

    const remote = data.find((room) => room.name === name);

    setSelectedRoomOnMap({
      element: room,
      baseElement: baseState,
      name: name,
      remote: remote || null,
    });

    setDrawerOpened(true);
  };

  const unselectRoomEl = () => {
    if (selectedRoomRef.current && selectedRoomRef.current.baseElement) {
      selectedRoomRef.current.element.replaceWith(
        selectedRoomRef.current.baseElement
      );
    }

    setSelectedRoomOnMap(null);
    setDrawerOpened(false);
  };

  const handleRoomClick = (e: Event) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const room = target.closest("[data-room]");

    if (!room) {
      return;
    }

    selectRoomEl(room);
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
    unselectRoomEl();
  };

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const handleSearch = (data: string) => {
    const results = searchInMapAndGraph(data, graph);
    setSearchResults(results);
  };

  const [dateTimePickerShow, setDateTimePickerShow] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());

  const [routesModalShow, setRoutesModalShow] = useState(false);

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
        <RoomDrawer
          isOpen={drawerOpened}
          onClose={handleCloseDrawer}
          room={selectedRoomOnMap?.remote || null}
          dateTime={selectedDateTime}
          scheduleAPI={scheduleAPI}
        />

        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {!isLoading && data && (
          <div className="relative z-0 mb-4 h-full w-full overflow-hidden">
            <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex flex-row items-center justify-between">
              <div className="z-20 mr-4 w-full sm:mx-auto sm:max-w-md md:mx-0 md:p-4">
                <SearchInput
                  showSubmitButton={true}
                  onSubmit={(data) => {
                    const result = searchInMapAndGraph(data, graph)[0];

                    if (!result) {
                      return;
                    }

                    const roomEl = searchRoomsByName(result.title)[0];
                    if (!roomEl) {
                      return;
                    }

                    selectRoomEl(roomEl);
                  }}
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

            <RoutesModal
              isOpen={routesModalShow}
              onClose={() => setRoutesModalShow(false)}
              onSubmit={(start: string, end: string) => {
                setRoutesModalShow(false);

                mapRouteRef.current?.renderRoute(start, end);
              }}
              aviableRooms={graph.vertices
                .map((v) => v.label ?? "")
                .filter((v) => v !== "")}
            />

            {/* Кнопка маршрута снизу слева */}
            <div className="absolute bottom-4 left-4 z-40">
              <button
                className="flex items-center justify-center space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-4"
                onClick={() => {
                  setRoutesModalShow(true);
                }}
              >
                <MapPin className="h-6 w-6" />
              </button>
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

export default MapContainer;
