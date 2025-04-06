/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_TYPE } from './api-config';
import db from '../../db.json';

/**
 * API Wrapper - Đơn giản hóa việc chuyển đổi từ SQL sang JSON
 * Khi API_TYPE là 'json', sử dụng db.json
 * Khi API_TYPE là 'sql', sử dụng các API từ backend
 */

// Đọc dữ liệu từ db.json
const getDB = () => {
    return JSON.parse(JSON.stringify(db));
};

// Lưu dữ liệu vào localStorage (giả lập việc ghi vào db.json)
const saveDB = (data: any) => {
    localStorage.setItem('readhasha_db', JSON.stringify(data));
    return data;
};

// Đọc dữ liệu từ localStorage (nếu có)
const getSavedDB = () => {
    const savedData = localStorage.getItem('readhasha_db');
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (error) {
            console.error('Lỗi khi đọc dữ liệu từ localStorage:', error);
        }
    }
    return getDB(); // Trả về dữ liệu mặc định nếu không có dữ liệu lưu trữ
};

// Mô phỏng response từ backend
const mockResponse = (data: any, message = 'Thành công', statusCode = 200) => {
    return {
        data,
        message,
        statusCode
    };
};

// Check nếu đang sử dụng JSON API
const isUsingJSON = () => API_TYPE === 'json';

// Export phương thức để kiểm tra loại API đang sử dụng
export const getAPIType = () => API_TYPE;

// Export các phương thức làm việc với dữ liệu JSON
export const jsonUtils = {
    getDB,
    saveDB,
    getSavedDB,
    mockResponse,
    isUsingJSON
};

export default {
    getAPIType,
    jsonUtils
}; 