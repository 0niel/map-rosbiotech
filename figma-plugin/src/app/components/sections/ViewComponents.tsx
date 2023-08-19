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

const ViewComponentsSection = () => {
  const navigate = useNavigate();
  const { mapConfig, updateMapConfig } = useConfigContext();

  return (
    <Table>
      <TableCaption>Список компонентов</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">id</TableHead>
          <TableHead>Тип</TableHead>
          <TableHead>Название</TableHead>
          <TableHead>Описание</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {mapConfig.componentObjects.map((object) => (
          <TableRow key={object.id}>
            <TableCell>{object.id}</TableCell>
            <TableCell>{object.type}</TableCell>
            <TableCell>{object.name}</TableCell>
            <TableCell>{object.description}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ViewComponentsSection;
