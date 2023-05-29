import { type Graph } from "~/lib/graph";
import { searchNodesByLabel } from '~/lib/graph';
import { type SearchResult } from '../SearchInput';
import { getRoomNameByElement, searchRoomsByName } from './roomHelpers';

export const searchInMapAndGraph = (
    data: string,
    graph: Graph
): SearchResult[] => {
    console.log(`Searching for ${data}`);
    if (data.length < 3) {
        return [];
    }
    const roomsInGraph = searchNodesByLabel(graph, data);
    if (!roomsInGraph) {
        console.log(`Room ${data} not found in graph`);
        return [];
    }
    const rooms = searchRoomsByName(data);
    if (!rooms) {
        console.log(`Room ${data} not found in map`);
        return [];
    }

    const found = roomsInGraph.filter((room) => {
        const name = room.label;

        if (rooms.map((room) => getRoomNameByElement(room)).includes(name)) {
            return true;
        }

        return false;
    });

    const results = Array.from(found, (room, i) => ({
        id: i.toString(),
        title: room.label,
    }));

    console.log(`Found ${results.length} rooms`);

    return results;
};
