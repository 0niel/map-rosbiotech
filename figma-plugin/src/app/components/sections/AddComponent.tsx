import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/app/components/ui/select';
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useNavigate } from 'react-router-dom';
import { useConfigContext } from '../../lib/configContext';

const AddComponentSection = () => {
  const [selectedComponent, setSelectedComponent] = React.useState<Record<string, any> | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [type, setType] = React.useState<'room' | 'toilet' | 'canteen' | 'atm' | 'stairs'>('room');

  const navigate = useNavigate();
  const { mapConfig, updateMapConfig } = useConfigContext();

  React.useEffect(() => {
    window.onmessage = (event) => {
      if (!event.data.pluginMessage) return;

      const { type, message } = event.data.pluginMessage;

      if (type === 'instance-selected') {
        const { id, instances } = message;

        setSelectedComponent({
          id,
          instances,
        });
      }
    };
  }, []);

  const onAddObject = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'object-add',
          object: {
            id: selectedComponent?.id,
            name: name,
            description: description,
            type: type,
          },
        },
      },
      '*'
    );

    const newMapObject = {
      id: selectedComponent?.id,
      name: name,
      description: description,
      type: type,
    } as any;

    const index = mapConfig.objectsComponents.findIndex((object) => object.id === selectedComponent?.id);
    if (index !== -1) {
      updateMapConfig({
        objectsComponents: [
          ...mapConfig.objectsComponents.slice(0, index),
          newMapObject,
          ...mapConfig.objectsComponents.slice(index + 1),
        ],
      });
    } else {
      updateMapConfig({
        objectsComponents: [...mapConfig.objectsComponents, newMapObject],
      });
    }

    navigate('/');
  };

  return selectedComponent ? (
    <div className="flex flex-col space-y-4">
      <h3>Выбранный компонент:</h3>

      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <p>ID компонента:</p>
            <p>{selectedComponent?.id}</p>
          </div>
          <div className="flex flex-col">
            <p>Количество экземпляров:</p>
            <p>{selectedComponent?.instances}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Label htmlFor="type">Тип объекта</Label>

        <Select value={type} onValueChange={(value) => setType(value as any)} defaultValue={type}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип объекта" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="room">Комната</SelectItem>
            <SelectItem value="toilet">Туалет</SelectItem>
            <SelectItem value="canteen">Столовая</SelectItem>
            <SelectItem value="atm">Банкомат</SelectItem>
            <SelectItem value="stairs">Лестница</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="horizontal" />

        <div className="flex flex-col space-y-2">
          <p className="text-sm text-gray-500 mb-2 mt-4">Необязательные поля</p>
          <Label htmlFor="name">Название</Label>
          <Input type="text" name="name" onChange={(e) => setName(e.target.value)} />

          <Label htmlFor="description">Описание</Label>
          <Input type="text" name="description" onChange={(e) => setDescription(e.target.value)} />
        </div>

        <Button onClick={onAddObject}>Добавить объект</Button>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center h-full">
      <h3>Выберите компонент на сцене</h3>
    </div>
  );
};

export default AddComponentSection;
