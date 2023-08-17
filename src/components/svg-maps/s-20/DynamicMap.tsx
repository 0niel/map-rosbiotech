import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("~/components/svg-maps/s-20/Map"), {
  ssr: false,
});

export default DynamicMap;
