import Floor0 from "./floor_0.svg";
import Floor1 from "./floor_1.svg";
import Floor2 from "./floor_2.svg";
import Floor3 from "./floor_3.svg";
import Floor4 from "./floor_4.svg";

const Map = ({ floor }: { floor: number }) => {
  switch (floor) {
    case 0:
      return <Floor0 />;
    case 1:
      return <Floor1 />;
    case 2:
      return <Floor2 />;
    case 3:
      return <Floor3 />;
    case 4:
      return <Floor4 />;
    default:
      return <Floor0 />;
  }
};

export default Map;