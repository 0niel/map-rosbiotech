import React from "react";
import FloorSelectorButtons from "./FloorSelectorButtons";
import ScaleButtons from "./ScaleButtons";
import { components } from "~/lib/schedule/schema";
import Tabs from "../Tabs";
import { Calendar, Info } from "lucide-react";
import RoomInfoTabContent from "./RoomInfoTabContent";
import { useQuery } from "react-query";
import ScheduleAPI from "~/lib/schedule/api";
import { getWeekByDate } from "~/lib/schedule/utils";
import RightDrawer from "../RightDrawer";
import Spinner from "../Spinner";
import ScheduleCalendar from "./ScheduleCalendar";
import Image from "next/image";

interface RoomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleAPI: ScheduleAPI;
  dateTime: Date;
  room: components["schemas"]["Room"] | null;
}

const getCurrentEvent = (
  lessons: components["schemas"]["Lesson"][],
  dateTime: Date,
) => {
  const date = new Date(dateTime);
  const week = getWeekByDate(date);
  // weekday 1 - понедельник, 2 - вторник, ...
  const weekday = date.getDay() === 0 ? 7 : date.getDay();

  const currentLessons = lessons.filter((lesson) => {
    const lessonWeeks = lesson.weeks;
    const lessonWeekday = lesson.weekday;

    const isWeekday = lessonWeekday === weekday;
    const isWeek = lessonWeeks.includes(week);

    const lessonStartTime = lesson.calls.time_start.slice(0, 5);
    const lessonEndTime = lesson.calls.time_end.slice(0, 5);

    const lessonStartDateTime = new Date(dateTime);
    const lessonEndDateTime = new Date(dateTime);

    const [lessonStartHours, lessonStartMinutes] = lessonStartTime.split(":");
    const [lessonEndHours, lessonEndMinutes] = lessonEndTime.split(":");

    if (
      !lessonStartHours ||
      !lessonStartMinutes ||
      !lessonEndHours ||
      !lessonEndMinutes
    ) {
      return false;
    }

    lessonStartDateTime.setHours(parseInt(lessonStartHours));
    lessonStartDateTime.setMinutes(parseInt(lessonStartMinutes));
    lessonEndDateTime.setHours(parseInt(lessonEndHours));
    lessonEndDateTime.setMinutes(parseInt(lessonEndMinutes));

    const isTime = date >= lessonStartDateTime && date <= lessonEndDateTime;

    return isWeekday && isWeek && isTime;
  });

  if (currentLessons.length === 0) {
    return null;
  }

  const currentLesson = currentLessons[0];

  if (!currentLesson) {
    return null;
  }

  const discipline = currentLesson.discipline.name;
  const teachers = currentLesson.teachers
    .map((teacher) => teacher.name)
    .join(", ");

  return { discipline, teachers };
};

const RoomDrawer: React.FC<RoomDrawerProps> = ({
  isOpen,
  onClose,
  dateTime,
  room,
  scheduleAPI,
}) => {
  const { isLoading, error, data } = useQuery(["room", room, dateTime], {
    queryFn: async () => {
      if (!room) {
        return;
      }
      const roomLessons = await scheduleAPI.getRoomSchedule(room.id);
      const roomInfo = await scheduleAPI.getRoomInfo(room.id);
      const roomStatus = await scheduleAPI.getRoomsStatuses(dateTime, [
        room.id,
      ]);

      return {
        lessons: roomLessons,
        info: roomInfo,
        status: roomStatus[0]?.status,
      };
    },
  });

  return (
    <div className="relative">
      <RightDrawer
        isOpen={isOpen}
        onClose={onClose}
        titleComponent={
          <h5
            id="drawer-right-label"
            className="mb-4 inline-flex items-center text-base font-bold text-gray-900 dark:text-gray-400"
          >
            Аудитория {room != null ? room.name : "не выбрана"}
          </h5>
        }
      >
        <div className="flex h-full flex-col">
          <Tabs>
            <Tabs.Tab name="Информация" icon={<Info />}>
              {isLoading && (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              )}
              {!isLoading && error ? (
                <div className="flex h-full items-center justify-center">
                  <p>Ошибка загрузки данных</p>
                </div>
              ) : null}
              {!room && (
                <div className="flex h-full flex-col items-center justify-center">
                  <Image
                    src="assets/ghost.svg"
                    width={200}
                    height={200}
                    alt={""}
                  />
                  <p className="text-center text-gray-500">
                    Нет данных по этой аудитории
                  </p>
                </div>
              )}
              {!isLoading && data && (
                <RoomInfoTabContent
                  workload={data?.info?.workload || 0}
                  status={data?.status === "free" ? "Свободна" : "Занята"}
                  purpose={data?.info?.purpose || ""}
                  eventName={
                    getCurrentEvent(data?.lessons || [], dateTime)
                      ?.discipline || ""
                  }
                  teacher={
                    getCurrentEvent(data?.lessons || [], dateTime)?.teachers ||
                    ""
                  }
                />
              )}
            </Tabs.Tab>
            <Tabs.Tab name="Расписание" icon={<Calendar />}>
              <ScheduleCalendar date={dateTime} lessons={data?.lessons || []} />
            </Tabs.Tab>
          </Tabs>
        </div>
      </RightDrawer>
    </div>
  );
};

export default RoomDrawer;
