import FloorMinus1 from "./-1.svg";
import Floor1 from "./1.svg";
import Floor2 from "./2.svg";
import Floor3 from "./3.svg";
import Floor4 from "./4.svg";
import Floor5 from "./5.svg";

const Map = ({ floor, onLoaded }: { floor: number; onLoaded?: () => void }) => {
  switch (floor) {
    case -1:
      return <FloorMinus1 onLoad={onLoaded} alt={""} />;
    case 1:
      return <Floor1 onLoad={onLoaded} alt={""} />;
    case 2:
      return <Floor2 onLoad={onLoaded} alt={""} />;
    case 3:
      return <Floor3 onLoad={onLoaded} alt={""} />;
    case 4:
      return <Floor4 onLoad={onLoaded} alt={""} />;
    case 5:
      return <Floor5 onLoad={onLoaded} alt={""} />;
    default:
      return <Floor1 onLoad={onLoaded} alt={""} />;
  }
};

export default Map;
