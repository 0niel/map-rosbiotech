import { Plus, Minus } from "lucide-react";
import { type components } from "~/lib/schedule/schema";

interface RoomInfoTabContentProps {
  dateTime: Date;
  room: components["schemas"]["Room"] | null;
}

const RoomInfoTabContent: React.FC<RoomInfoTabContentProps> = ({
  dateTime,
  room,
}) => {
  console.log("SUPER SELECTED ROOM: ");

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-500">
        <caption className="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800">
          <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            Информация о кабинете отображается для выбранного времени и даты
          </p>
        </caption>

        <tbody>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Назначение
            </th>
            <td className="px-6 py-4">Практика</td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Загруженность
            </th>
            <td className="px-6 py-4">65%</td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Статус
            </th>
            <td className="px-6 py-4">Занято</td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Мероприятие
            </th>
            <td className="px-6 py-4">
              Объектно-ориентированное программирование
            </td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Ответственный
            </th>
            <td className="px-6 py-4">Путуриде З.Ш.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RoomInfoTabContent;
