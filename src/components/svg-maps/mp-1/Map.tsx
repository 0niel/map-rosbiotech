import FloorMinus1 from "./-1.svg";
import Floor1 from "./1.svg";
import Floor2 from "./2.svg";
import Floor3 from "./3.svg";
import Floor4 from "./4.svg";
import Floor5 from "./5.svg";

const Map = ({ floor }: { floor: number }) => {
  switch (floor) {
    case -1:
      return <FloorMinus1 />;
    case 1:
      return <Floor1 />;
    case 2:
      return <Floor2 />;
    case 3:
      return <Floor3 />;
    case 4:
      return <Floor4 />;
    case 5:
      return <Floor5 />;
    default:
      return <Floor1 />;
  }
};

export default Map;