import { type AppType } from "next/app"
import { api } from "~/utils/api"
import "~/styles/globals.css"
import { QueryClientProvider } from "react-query"
import Head from "next/head"
import queryClient from "~/lib/queryClient"
import { Toaster } from "react-hot-toast"

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta name="application-name" content="Карта РТУ МИРЭА" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Карта РТУ МИРЭА" />
        <meta name="description" content="Интерактивная карта кампусов РТУ МИРЭА" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#2B5797" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://map.mirea.ru" />
        <meta name="twitter:title" content="Карта РТУ МИРЭА" />
        <meta name="twitter:description" content="Интерактивная карта кампусов РТУ МИРЭА" />
        <meta name="twitter:image" content="https://map.mirea.ru/icons/android-chrome-192x192.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Карта РТУ МИРЭА" />
        <meta property="og:description" content="Интерактивная карта кампусов РТУ МИРЭА" />
        <meta property="og:site_name" content="Карта РТУ МИРЭА" />
        <meta property="og:url" content="https://map.mirea.ru" />
        <meta property="og:image" content="https://map.mirea.ru/icons/apple-touch-icon.png" />

        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
      </Head>
      <main>
        <QueryClientProvider client={queryClient}>
          <Toaster position="bottom-center" />
          <Component {...pageProps} />
        </QueryClientProvider>
      </main>
    </>
  )
}

export default api.withTRPC(MyApp)
