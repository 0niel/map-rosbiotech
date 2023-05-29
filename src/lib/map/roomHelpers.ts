export const fillRoom = (room: Element, color: string) => {
    const rect = room.querySelector("rect");
    if (rect) {
        rect.style.fill = color;
    }
};

export const encodeRoomName = (roomName: string) => {
    const roomNameEncoded = roomName.replace(
        /\\u([0-9A-F]{4})/gi,
        (_, p1: string) => String.fromCharCode(parseInt(p1, 16))
    );
    return roomNameEncoded;
};

export const getRoomNameByElement = (el: Element) => {
    const roomName = el.getAttribute("data-room");
    if (!roomName) {
        return null;
    }

    // Формат: "В-78__А-101", где "В-78" - кампус, "А-101" - номер комнаты

    return encodeRoomName(roomName).split("__")[1];
};

export const searchRoomsByName = (name: string) => {
    const rooms = document.querySelectorAll("[data-room]");
    const foundRooms = [];

    for (const room of rooms) {
        const roomName = getRoomNameByElement(room);
        if (roomName?.trim().toLowerCase().includes(name.trim().toLowerCase())) {
            foundRooms.push(room);
        }
    }

    return foundRooms;
};
