import { api } from './api';

export const fetchAttendanceRecords = async (filters: any) => {
    const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
    );
    const response = await api.get('/api/monthly-attendance', { params });
    return response.data;
};
