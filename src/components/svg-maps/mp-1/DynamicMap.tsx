import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("~/components/svg-maps/mp-1/Map"), {
  ssr: false,
});

export default DynamicMap;
