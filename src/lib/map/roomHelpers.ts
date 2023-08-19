export const fillRoom = (room: Element, color: string) => {
  const rect = room.querySelectorAll("rect")
  if (rect) {
    rect.forEach((rect) => {
      rect.setAttribute("fill", color)
    })
  }

  const isPathShape = (el: Element) => {
    // Проверка, что path элемент является дочерней фигурой, а не текстом
    const className = el.getAttribute("class")
    if (className && className.toLowerCase().includes("rectangle")) {
      return true
    }

    const d = el.getAttribute("d")
    // m - начало новой точки. В примитивах не должно быть слишком много точек
    // z - конец фигуры (замыкание)
    if (d && d.toLowerCase().split("m").length < 8 && d.toLowerCase().indexOf("z") === d.length - 1) {
      return true
    }

    return false
  }

  const path = room.querySelectorAll("path")
  if (path) {
    path.forEach((path) => {
      if (isPathShape(path)) {
        path.setAttribute("fill", color)
      }
    })
  }
}

// type MapObjectType = "room" | "toilet" | "canteen" | "atm" | "stairs";

// const getTypeByShortName = (shortName: string): MapObjectType => {
//     switch (shortName) {
//         case "r":
//             return "room";
//         case "t":
//             return "toilet";
//         case "c":
//             return "canteen";
//         case "a":
//             return "atm";
//         case "s":
//             return "stairs";
//         default:
//             return "room";
//     }
// };

export const encodeRoomName = (roomName: string) => {
  const roomNameEncoded = roomName.replace(/\\u([0-9A-F]{4})/gi, (_, p1: string) =>
    String.fromCharCode(parseInt(p1, 16)),
  )
  return roomNameEncoded
}

const isMapObject = (el: Element) => {
  return el.getAttribute("data-object") != null
}

export const getMapObjectNameByElement = (el: Element) => {
  // Формат: "{mapObjectIdentifier}__В-78__r__А-101", где "В-78" - название корпуса, "r" - тип объекта, "А-101" - название объекта
  try {
    if (!isMapObject(el)) return null

    const names = el.getAttribute("data-object")?.split("__")
    const name = names?.[names.length - 1]
    if (name) {
      return encodeRoomName(name)
    }
    return null
  } catch (e) {
    return null
  }
}

export const mapObjectSelector = `[data-object]`

export const getAllMapObjectsElements = (document: Document = window.document) => {
  const rooms = document.querySelectorAll(mapObjectSelector)

  const roomsEls = Array.from(rooms).map((room) => {
    const parent = room.parentElement
    if (!parent) {
      return room
    }

    if (getMapObjectNameByElement(parent) == getMapObjectNameByElement(room)) {
      return parent
    }

    return room
  })

  return roomsEls
}

export const searchMapObjectsByName = (name: string) => {
  const roomsEls = getAllMapObjectsElements()

  const foundRooms = []

  for (const room of roomsEls) {
    const roomName = getMapObjectNameByElement(room)
    if (roomName?.trim().toLowerCase() == name.trim().toLowerCase()) {
      foundRooms.push(room)
    }
  }

  return foundRooms
}
