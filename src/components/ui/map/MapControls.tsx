import React from "react";
import FloorSelectorButtons from "./FloorSelectorButtons";
import ScaleButtons from "./ScaleButtons";

interface MapControlsProps {
  selectedFloor: number;
  setSelectedFloor: (floor: number) => void;
  floors: number[];
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  selectedFloor,
  setSelectedFloor,
  floors,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="absolute bottom-12 right-2 z-20 md:right-12">
      {/*<FloorSelectorButtons*/}
      {/*  floors={[1, 2, 3, 4]}*/}
      {/*  selectedFloor={selectedFloor}*/}
      {/*  onFloorSelect={(floor) => setSelectedFloor(floor)}*/}
      {/*/>*/}
      <div className="mt-4">
        <ScaleButtons onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      </div>
    </div>
  );
};

export default MapControls;
