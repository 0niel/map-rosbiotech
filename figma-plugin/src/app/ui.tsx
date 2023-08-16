import React from 'react';
import { Button } from '@/src/app/components/ui/button';
import { Label } from './components/ui/label';
import { useNavigate } from 'react-router-dom';
import { ConfigContext, useConfigContext } from './lib/configContext';
import { Input } from './components/ui/input';

const UI = ({}) => {
  const { mapConfig, updateMapConfig } = useConfigContext();

  React.useEffect(() => {
    window.onmessage = (event) => {
      if (!event.data.pluginMessage) return;

      const { type, message } = event.data.pluginMessage;
      if (type === 'config-updated') {
        const { config } = message;
        updateMapConfig(config);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const text = event.target.result;

      try {
        const json = JSON.parse(text as string);
        parent.postMessage(
          {
            pluginMessage: {
              type: 'load-config',
              config: JSON.stringify(json),
            },
          },
          '*'
        );
      } catch (error) {
        console.log(error);
      }
    };

    reader.readAsText(file);
  };

  const navigate = useNavigate();

  React.useEffect(() => {
    console.log(mapConfig);
  }, [mapConfig]);

  const onExportConfig = () => {
    const blob = new Blob([JSON.stringify(mapConfig)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    a.click();
  };

  return (
    <div className="flex flex-col">
      <div className="mt-20 flex flex-col space-y-4">
        <Button onClick={() => navigate('/add-component')}>Добавить компонента карты</Button>
        {mapConfig.objectsComponents.length > 0 && (
          <>
            <Button onClick={() => navigate('/view-components')}>Выбранные компоненты</Button>
            <Button onClick={() => navigate('/map-components')}>Замаппить компоненты</Button>
          </>
        )}

        <div className="flex flex-col">
          <Label htmlFor="file">Импорт конфига из json</Label>
          <Input id="file" type="file" onChange={handleFileChange} />
        </div>

        {mapConfig.objectsComponents.length > 0 && (
          <div className="flex flex-col space-y-2">
            <Label htmlFor="export-config">Экспорт конфига</Label>
            <Button id="export-config" onClick={onExportConfig}>
              Экспортировать
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UI;
