import { createContext, useContext } from 'react';

export interface ConfigContextType {
    mapConfig: MapConfig;
    updateMapConfig: (newConfig: MapConfig) => void;
}

export const ConfigContext = createContext<ConfigContextType>({
    mapConfig: {
        objectsComponents: []
    },
    updateMapConfig: () => { }
});

export const useConfigContext = () => useContext(ConfigContext);


