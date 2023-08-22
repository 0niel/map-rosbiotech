import V78Map from "~/components/svg-maps/v-78/DynamicMap"
import S20Map from "~/components/svg-maps/s-20/DynamicMap"
import MP1 from "~/components/svg-maps/mp-1/DynamicMap"

const campuses = [
  {
    label: "В-78",
    description: "Проспект Вернадского, 78",
    map: V78Map,
    floors: [4, 3, 2, 1, 0],
    initialFloor: 2,
    initialScale: 0.2,
    initialPositionX: -600,
    initialPositionY: -134,
  },
  {
    label: "С-20",
    description: "Стромынка, 20",
    map: S20Map,
    floors: [4, 3, 2, 1],
    initialFloor: 1,
    initialScale: 0.25,
    initialPositionX: 183.5,
    initialPositionY: 102.5,
  },
  {
    label: "МП-1",
    description: "Малая Пироговская, 1",
    map: MP1,
    floors: [5, 4, 3, 2, 1, -1],
    initialFloor: 1,
    initialScale: 0.25,
    initialPositionX: -130,
    initialPositionY: -77,
  },
]

export default campuses
