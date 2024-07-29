import { DataSource } from "./data-source";
import { LessonSchedulePart } from "./models/lesson-schedule-part";



export type DataSourceType = 'local' | 'rosbiotech';

export interface DataSourceConfig {
    type: DataSourceType;
    endpoint?: string;
    data?: LessonSchedulePart[];
}

export class LocalDataSource implements DataSource {
    private data: LessonSchedulePart[];

    constructor(data: LessonSchedulePart[]) {
        this.data = data;
    }

    async fetchLessons(startDate: Date, endDate: Date, room: string, campus: string): Promise<LessonSchedulePart[]> {
        return this.data;
    }
}

export const createDataSource = (config: DataSourceConfig): DataSource => {
    switch (config.type) {
        case 'local':
            if (!config.data) {
                throw new Error('Local data must be provided for local data source');
            }
            return new LocalDataSource(config.data);
        case 'rosbiotech':
            const { RosbiotechDataSource } = require('./custom-data-sources/rosbiotech-data-source');
            return new RosbiotechDataSource(config.endpoint);
        default:
            throw new Error('Invalid data source type');
    }
};
