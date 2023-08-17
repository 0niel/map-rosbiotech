import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("~/components/svg-maps/v-78/Map"), {
  ssr: false,
});

export default DynamicMap;
