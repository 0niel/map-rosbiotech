import React from 'react';
import ReactDOM from 'react-dom';
import UI from './ui';
import AddComponentSection from '@/src/app/components/sections/AddComponent';
import ViewComponentsSection from '@/src/app/components/sections/ViewComponents';
import MapComponentsSection from './components/sections/MapComponents';

import './styles/global.css';

import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { ConfigContext, useConfigContext } from './lib/configContext';

const router = createMemoryRouter([
  {
    path: '/',
    element: <UI />,
  },
  {
    path: '/add-component',
    element: <AddComponentSection />,
  },
  {
    path: '/view-components',
    element: <ViewComponentsSection />,
  },
  {
    path: '/map-components',
    element: <MapComponentsSection />,
  },
]);

const App = () => {
  const [mapConfig, setMapConfig] = React.useState({
    objectsComponents: [],
  });

  const updateMapConfig = (newConfig) => {
    setMapConfig(newConfig);
  };

  return (
    <ConfigContext.Provider value={{ mapConfig, updateMapConfig }}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </ConfigContext.Provider>
  );
};

ReactDOM.render(
  <App />,

  document.getElementById('react-page')
);
