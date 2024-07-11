import { type NextPage } from 'next'
import Head from 'next/head'
import React from 'react'
import DynamicLayoutWithSidebar from '~/components/ui/layoutWithSidebar/DynamicLayoutWithSidebar'
import DynamicMapContainer from '~/components/ui/map/DynamicMapContainer'

const Map: NextPage = () => {
    return (
        <>
            <Head>
                <title>Интерактивная карта РОСБИОТЕХ</title>
                <meta
                    name="description"
                    content="Интерактивная карта кампусов РОСБИОТЕХ. Стройте маршруты и следите за расписанием прям на онлайн-карте!"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <DynamicLayoutWithSidebar>
                <DynamicMapContainer />
            </DynamicLayoutWithSidebar>
        </>
    )
}
export default Map
