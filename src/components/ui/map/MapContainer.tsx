import { useRouter } from "next/router";
import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { useEffect, useRef, useState } from "react";
import SearchButton from "../SearchButton";
import DropdownRadio from "../DropdownRadio";
import routesJson from "public/routes.json";
import { type Graph } from "~/lib/graph";
import MapRoute, { type MapRouteRef } from "./MapRoute";
import ScheduleAPI from "~/lib/schedule/api";
import { useQuery } from "react-query";
import { Spinner } from "flowbite-react";
import { MapPin } from "lucide-react";
import { type RoomOnMap } from "~/lib/map/RoomOnMap";
import {
  fillRoom,
  getAllMapObjectsElements,
  getMapObjectNameByElement,
  mapObjectSelector,
  searchMapObjectsByName,
} from "~/lib/map/roomHelpers";
import { searchInMapAndGraph } from "~/lib/map/searchInMapInGraph";
import MapControls from "./MapControls";
import RoomDrawer from "./RoomDrawer";
import RoutesModal from "./RoutesModal";
import V78Map from "~/components/svg-maps/v-78/DynamicMap";
import S20Map from "~/components/svg-maps/s-20/DynamicMap";
import MP1 from "~/components/svg-maps/mp-1/DynamicMap";
import React from "react";
import { SearchResult } from "../SearchInput";

const scheduleAPI = new ScheduleAPI();

const campuses = [
  {
    label: "В-78",
    description: "Проспект Вернадского, 78",
    map: V78Map,
    floors: [0, 1, 2, 3, 4],
    initialScale: 0.2,
    initialPositionX: -600,
    initialPositionY: -134,
  },
  // {
  //   label: "В-86",
  //   description: "Проспект Вернадского, 86",
  // },
  {
    label: "С-20",
    description: "Стромынка, 20",
    map: S20Map,
    floors: [1, 2, 3, 4],
    initialScale: 0.25,
    initialPositionX: 183.5,
    initialPositionY: 102.5,
  },
  {
    label: "МП-1",
    description: "Малая Пироговская, 1",
    map: MP1,
    floors: [-1, 1, 2, 3, 4, 5],
    initialScale: 0.25,
    initialPositionX: -130,
    initialPositionY: -77,
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
        (campus) => campus.short_name === selectedCampus,
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
    loadJsonToGraph(JSON.stringify(routesJson)),
  );

  const mapRouteRef = useRef<MapRouteRef>(null);

  const [drawerOpened, setDrawerOpened] = useState(false);

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [selectedFloor, setSelectedFloor] = useState(3);
  const [selectedCampus, setSelectedCampus] = useState("В-78");

  const [selectedRoomOnMap, setSelectedRoomOnMap] = useState<RoomOnMap | null>(
    null,
  );
  const selectedRoomRef = useRef<RoomOnMap | null>(null);

  useEffect(() => {
    if (!isLoading && transformComponentRef.current) {
      if (!router.query.room) {
        return;
      }

      const room = searchMapObjectsByName(
        router.query.room as string,
      )[0] as Element;
      if (room) {
        selectRoomEl(room);
      }
    }
  }, [isLoading, transformComponentRef.current]);

  const selectRoomEl = (room: Element) => {
    if (selectedRoomRef.current && selectedRoomRef.current.baseElement) {
      selectedRoomRef.current.element.replaceWith(
        selectedRoomRef.current.baseElement,
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

    const name = getMapObjectNameByElement(room);
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
        selectedRoomRef.current.baseElement,
      );
    }

    setSelectedRoomOnMap(null);
    setDrawerOpened(false);
  };

  const handleRoomClick = (e: Event) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    let room = target.closest(mapObjectSelector);
    if (
      getMapObjectNameByElement(room?.parentElement as Element) ===
      getMapObjectNameByElement(room as Element)
    ) {
      room = room?.parentElement as Element;
    }

    if (!room) {
      return;
    }

    selectRoomEl(room);
  };

  useEffect(() => {
    selectedRoomRef.current = selectedRoomOnMap;
  }, [selectedRoomOnMap]);

  const [campusMap, setCampusMap] = useState(
    campuses.find((campus) => campus.label === "В-78"),
  );

  useEffect(() => {
    const map = campuses.find((campus) => campus.label === selectedCampus);

    const currentScreenWidth = window.innerWidth;
    const isSmallScreen = currentScreenWidth < 1024;

    transformComponentRef.current?.setTransform(
      isSmallScreen
        ? map?.initialPositionX ?? 0 * 2
        : map?.initialPositionX ?? 0,
      map?.initialPositionY ?? 0,
      map?.initialScale ?? 1,
      undefined,
    );
    setCampusMap(map);
  }, [selectedCampus]);

  useEffect(() => {
    if (!data || isLoading) {
      return;
    }

    const roomsElements = getAllMapObjectsElements();

    roomsElements.forEach((room) => {
      (room as HTMLElement).style.cursor = "pointer";
      room.addEventListener("click", handleRoomClick);
    });

    return () => {
      roomsElements.forEach((room) => {
        room.removeEventListener("click", handleRoomClick);
      });
    };
  }, [campusMap, data, isLoading, selectedFloor]);

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
      {/* <div className="absolute left-14 right-0 top-0 block transition-all duration-300 sm:hidden">
        <div className="pointer-events-none flex flex-row items-center justify-between px-4 py-2">
          <div className="z-20 mr-4 w-full transition-all duration-300 ease-in-out sm:mx-auto sm:w-80 sm:max-w-md md:mx-0 md:p-4">
            <SearchButton
              // showSubmitButton={false}
              // onSubmit={(data) => {
              //   const result = searchInMapAndGraph(data, graph)[0];

              //   if (!result) {
              //     return;
              //   }

              //   const roomEl = searchMapObjectsByName(result.title)[0];
              //   if (!roomEl) {
              //     return;
              //   }

              //   selectRoomEl(roomEl);
              // }}
              // onChange={handleSearch}
              // searchResults={searchResults}
              onClick={() => {}}
              text="Поиск..."
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
      </div> */}

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
            {/* <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 hidden flex-row items-center justify-between px-4 py-2 transition-all duration-300 ease-in-out sm:flex md:px-0 md:py-0">
              <div className="z-20 mr-4 w-full transition-all duration-300 ease-in-out sm:mx-auto sm:w-80 sm:max-w-md md:mx-0 md:p-4">
                <SearchButton
                  // showSubmitButton={false}
                  // onSubmit={(data) => {
                  //   const result = searchInMapAndGraph(data, graph)[0];

                  //   if (!result) {
                  //     return;
                  //   }

                  //   const roomEl = searchMapObjectsByName(result.title)[0];
                  //   if (!roomEl) {
                  //     return;
                  //   }

                  //   selectRoomEl(roomEl);
                  // }}
                  // onChange={handleSearch}
                  // searchResults={searchResults}
                  onClick={() => {}}
                  text="Поиск..."
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
            </div> */}

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

            <div className="pointer-events-none fixed bottom-0 z-10 flex w-full flex-row items-end justify-between px-4 py-2 md:px-8 md:py-4">
              {/* Кнопка маршрута снизу слева */}
              <button
                className="pointer-events-auto flex items-center justify-center space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-3 sm:p-4"
                onClick={() => {
                  setRoutesModalShow(true);
                }}
              >
                <MapPin className="h-6 w-6" />
              </button>

              <div className="z-30 md:fixed md:right-10">
                <MapControls
                  onZoomIn={() => transformComponentRef.current?.zoomIn()}
                  onZoomOut={() => transformComponentRef.current?.zoomOut()}
                  floors={
                    campuses.find((c) => c.label === selectedCampus)?.floors ||
                    []
                  }
                  selectedFloor={selectedFloor}
                  setSelectedFloor={setSelectedFloor}
                />
              </div>
            </div>

            <TransformWrapper
              minScale={0.05}
              initialScale={campusMap?.initialScale ?? 1}
              initialPositionX={campusMap?.initialPositionX ?? 0}
              initialPositionY={campusMap?.initialPositionY ?? 0}
              maxScale={1}
              panning={{ disabled: false, velocityDisabled: true}}
              wheel={{ disabled: false, step: 0.05 }}
              pinch={{ step: 0.05  }}
              zoomAnimation={{ disabled: true }}
              ref={transformComponentRef}
              smooth={false}
              alignmentAnimation={{ disabled: true }}
              velocityAnimation={{ disabled: true }}
              limitToBounds={false}
              centerZoomedOut={false}
              // centerOnInit={true}
              disablePadding={false}
              

              // onTransformed={(ref, event) => {
              //   console.log(ref.state);
              // }}
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
                {React.createElement(campusMap?.map ?? "div", {
                  floor: selectedFloor,
                })}
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapContainer;
