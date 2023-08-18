import React from "react";
import Floor1 from "./floor_1.svg";
import Floor2 from "./floor_2.svg";
import Floor3 from "./floor_3.svg";
import Floor4 from "./floor_4.svg";

const Map = ({ floor, onLoaded }: { floor: number; onLoaded?: () => void }) => {
  switch (floor) {
    case 1:
      return <Floor1 onLoad={onLoaded} alt={""} />;
    case 2:
      return <Floor2 onLoad={onLoaded} alt={""} />;
    case 3:
      return <Floor3 onLoad={onLoaded} alt={""} />;
    case 4:
      return <Floor4 onLoad={onLoaded} alt={""} />;
    default:
      return <Floor1 onLoad={onLoaded} alt={""} />;
  }
};

export default Map;
