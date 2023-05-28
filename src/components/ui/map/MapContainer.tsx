import {
  TransformWrapper,
  TransformComponent,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import Floor2 from "~/components/svg/floor_2.svg";
import FloorSelectorButtons from "./FloorSelectorButtons";
import { useEffect, useRef, useState } from "react";
import SearchInput from "../SearchInput";
import ScaleButtons from "./ScaleButtons";
import RightDrawer from "../RightDrawer";
import { Info } from "lucide-react";
import Tabs from "../Tabs";
import { BadgeInfo, Calendar } from "lucide-react";
import DropdownRadio from "../DropdownRadio";
import routesJson from "public/routes.json";
import { Graph } from "~/lib/graph";
import MapRoute, { MapRouteRef } from "./MapRoute";

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

export const MapContainer = () => {
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

  const handleClick = (e: Event) => {
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
      base.addEventListener("click", handleClick);
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
    const rooms = document.querySelectorAll("[data-room]");

    rooms.forEach((room) => {
      (room as HTMLElement).style.cursor = "pointer";
      room.addEventListener("click", handleClick);
    });

    return () => {
      rooms.forEach((room) => {
        room.removeEventListener("click", handleClick);
      });
    };
  }, [selectedFloor]);

  const handleCloseDrawer = () => {
    setDrawerOpened(false);
  };

  useEffect(() => {
    if (mapRouteRef.current) {
      mapRouteRef.current.renderRoute("А-5", "А-4");
    }
  }, [graph]);

  return (
    <div className="h-full rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
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
              <div>1</div>
            </Tabs.Tab>
            <Tabs.Tab name="Расписание" icon={<Calendar />}>
              <div>2</div>
            </Tabs.Tab>
          </Tabs>
        </div>
      </RightDrawer>

      <div className="relative z-0 mb-4 h-full w-full">
        <div className="absolute left-0 right-0 top-0 z-10 flex flex-row items-center justify-between">
          <div className="z-20 mr-4 w-full sm:mx-auto sm:max-w-md md:mx-0">
            <SearchInput
              onSubmit={(data) => console.log(data)}
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
            />
          </div>
        </div>

        <div className="absolute bottom-12 right-12 z-20">
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
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
            <MapRoute
              ref={mapRouteRef}
              className="pointer-events-none absolute z-20 h-full w-full"
              graph={graph}
            />

            <Floor2 />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
};
