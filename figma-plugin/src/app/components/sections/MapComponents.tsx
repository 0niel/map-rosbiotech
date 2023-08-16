import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/app/components/ui/select';
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useNavigate } from 'react-router-dom';
import { useConfigContext } from '../../lib/configContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/app/components/ui/table';

const MapComponentsSection = () => {
  const navigate = useNavigate();
  const { mapConfig, updateMapConfig } = useConfigContext();

  const campuses = ['В-78', 'В-86', 'С-20', 'МП-1'];
  const [campus, setCampus] = React.useState(campuses[0]);

  const [isNodesSelected, setIsNodesSelected] = React.useState(false);

  React.useEffect(() => {
    window.onmessage = (event) => {
      if (!event.data.pluginMessage) return;

      const { type, message } = event.data.pluginMessage;

      console.log(type, message);

      if (type === 'nodes-selected') {
        const { selected } = message;

        setIsNodesSelected(selected);
      }
    };
  }, []);

  return (
    <div>
      <div>
        <Label htmlFor="campus">Кампус</Label>

        <Select value={campus} onValueChange={(value) => setCampus(value as any)} defaultValue={campus}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите кампус" />
          </SelectTrigger>

          <SelectContent>
            {campuses.map((campus) => (
              <SelectItem key={campus} value={campus}>
                {campus}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isNodesSelected && (
        <div>
          <Label>Вы выделили узлы</Label>

          <Button
            onClick={() => {
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'map-components',
                    campus: campus,
                  },
                },
                '*'
              );
            }}
          >
            Замаппить
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapComponentsSection;
