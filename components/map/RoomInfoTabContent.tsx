import { Teacher } from '@/lib/schedule/models/teacher'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'

interface RoomInfoTabContentProps {
  purpose: string
  workload: number
  status: string
  eventName: string
  teachers: Teacher[]
}

const RoomInfoTabContent: React.FC<RoomInfoTabContentProps> = ({
  purpose,
  workload,
  status,
  eventName,
  teachers
}) => {
  const { timeToDisplay } = useDisplayModeStore()

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-500">
        <caption className="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800">
          <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            Информация о кабинете отображается для{' '}
            {timeToDisplay.toLocaleDateString('ru')} в{' '}
            {timeToDisplay.toLocaleString('ru', {
              hour: 'numeric',
              minute: 'numeric'
            })}
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
            <td className="px-6 py-4">{purpose}</td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Загруженность
            </th>
            <td className="px-6 py-4">{workload}%</td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Статус
            </th>
            <td className="px-6 py-4">{status}</td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Мероприятие
            </th>
            <td className="px-6 py-4">{eventName}</td>
          </tr>
          <tr className="border-b bg-white">
            <th
              scope="row"
              className="whitespace-nowrap px-6 py-4 font-medium text-gray-900"
            >
              Ответственный
            </th>
            <td className="px-6 py-4">
              {teachers.map(teacher => teacher.name).join(', ')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default RoomInfoTabContent
