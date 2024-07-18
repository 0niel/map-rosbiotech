"use client"

import config from './config';


export interface Campus {
    shortName: string;
    description: string;
    floors: number[];
    initialFloor: number;
    initialScale: number;
    initialPositionX: number;
    initialPositionY: number;
}


const campuses: Campus[] = config.campuses;

export const initialCampus = campuses[0] as Campus;

export default campuses;