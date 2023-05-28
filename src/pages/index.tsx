import { type NextPage } from "next";
import Head from "next/head";
import React from "react";
import LayoutWithSidebar from "~/components/ui/LayoutWithSidebar";
import { MapContainer } from "~/components/ui/map/MapContainer";

const Map: NextPage = () => {
  return (
    <>
      <Head>
        <title>Интерактивная карта кампусов РТУ МИРЭА</title>
        <meta
          name="description"
          content="Интерактивная карта кампусов РТУ МИРЭА"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LayoutWithSidebar>
        <MapContainer />
      </LayoutWithSidebar>
    </>
  );
};
export default Map;
