
import axios, { type AxiosInstance, AxiosResponse, type AxiosError } from 'axios';
import { type components } from './schema'

const API_URL = 'http://localhost:8080/api'


class ScheduleAPI {
    private apiClient: AxiosInstance;

    constructor() {
        this.apiClient = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: false,
        });
    }

    private handleError(error: AxiosError) {
        console.error('API Error:', error.response);
        throw error;
    }

    async getCampuses(): Promise<components['schemas']['Campus'][]> {
        const response = await this.apiClient.get('/campuses');

        return response.data as components['schemas']['Campus'][];
    }

    async getRooms(campus_id: number): Promise<components['schemas']['Room'][]> {
        const response = await this.apiClient.get(`/rooms?campus_id=${campus_id}&limit=500&offset=0`);

        return response.data as components['schemas']['Room'][];
    }

}



export default ScheduleAPI;
