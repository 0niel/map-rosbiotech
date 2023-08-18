import dynamic from "next/dynamic";
import Spinner from "~/components/ui/Spinner";

const DynamicMap = dynamic(() => import("~/components/svg-maps/mp-1/Map"), {
  ssr: false,
  loading: () => <Spinner />,
});

export default DynamicMap;
