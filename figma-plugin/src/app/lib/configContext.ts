import { createContext, useContext } from 'react';

export interface ConfigContextType {
    mapConfig: MapConfig;
    updateMapConfig: (newConfig: MapConfig) => void;
}

export const ConfigContext = createContext<ConfigContextType>({
    mapConfig: {
        componentObjects: []
    },
    updateMapConfig: () => { }
});

export const useConfigContext = () => useContext(ConfigContext);


