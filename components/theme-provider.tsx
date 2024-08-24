'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * ThemeProvider Component
 *
 * This component uses `next-themes` to provide theme management for your application.
 * It listens for messages from external sources (e.g., Flutter WebView) to dynamically
 * change the theme based on incoming data.
 *
 * Usage:
 *
 * 1. Embed your React app inside a WebView or iframe in another application (e.g., a Flutter app).
 *
 * 2. From the embedding application, send a postMessage to the web app to change the theme.
 *
 * Example for Flutter:
 *
 * ```dart
 * import 'package:flutter/material.dart';
 * import 'package:webview_flutter/webview_flutter.dart';
 *
 * class MyWebView extends StatefulWidget {
 *   @override
 *   _MyWebViewState createState() => _MyWebViewState();
 * }
 *
 * class _MyWebViewState extends State<MyWebView> {
 *   late WebViewController _controller;
 *
 *   @override
 *   Widget build(BuildContext context) {
 *     return WebView(
 *       initialUrl: 'https://your-web-url.com',
 *       javascriptMode: JavascriptMode.unrestricted,
 *       onWebViewCreated: (WebViewController webViewController) {
 *         _controller = webViewController;
 *       },
 *       onPageFinished: (String url) {
 *         // Get the current theme and pass it to the web page
 *         final theme = Theme.of(context).brightness == Brightness.dark ? 'dark' : 'light';
 *         _controller.runJavascript('window.postMessage({ type: "SET_THEME", theme: "$theme" }, "*");');
 *       },
 *     );
 *   }
 * }
 * ```
 *
 * 3. When the message is received by the React app, it will update the theme accordingly.
 */

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeUpdater />
      {children}
    </NextThemesProvider>
  )
}

function ThemeUpdater() {
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const handleThemeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SET_THEME') {
        console.log(event)
        const newTheme = event.data.theme
        setTheme(newTheme)
      }
    }

    window.addEventListener('message', handleThemeMessage)

    return () => {
      window.removeEventListener('message', handleThemeMessage)
    }
  }, [setTheme])

  return null
}
