import dayjs from "dayjs";
import moment from 'moment'; // Hoặc thư viện xử lý ngày tháng khác

export const FORMATE_DATE_DEFAULT = "YYYY-MM-DD";
export const FORMATE_DATE_VN = "DD-MM-YYYY";
export const MAX_UPLOAD_IMAGE_SIZE = 2; //2MB

export const dateRangeValidate = (dateRange: any) => {
    if (!dateRange) return undefined;

    const startDate = dayjs(dateRange[0], FORMATE_DATE_DEFAULT).toDate();
    const endDate = dayjs(dateRange[1], FORMATE_DATE_DEFAULT).toDate();

    return [startDate, endDate];
};

export const validateDate = (value: any) => {
    if (!value) {
        return Promise.reject(new Error("Vui lòng nhập ngày sinh"));
    }

    const selectedDate = new Date(value);
    const currentDate = new Date();

    // Kiểm tra ngày trong tương lai
    if (selectedDate > currentDate) {
        return Promise.reject(new Error("Ngày sinh không thể ở tương lai"));
    }

    // Kiểm tra ngày quá cũ
    const minDate = new Date('1900-01-01');
    if (selectedDate < minDate) {
        return Promise.reject(new Error("Ngày sinh không hợp lệ (trước 1900)"));
    }

    return Promise.resolve();
};

export function toDate(input: unknown): Date | undefined {
    try {
        // Trường hợp input là đối tượng Moment
        if (moment.isMoment(input)) {
            return input.toDate();
        }

        // Trường hợp input là Date
        if (input instanceof Date) {
            return new Date(input);
        }

        // Trường hợp input là chuỗi ISO hoặc có thể parse thành Date
        if (typeof input === 'string') {
            const date = new Date(input);
            if (!isNaN(date.getTime())) return date;
        }

        // Trường hợp input là timestamp (number)
        if (typeof input === 'number') {
            return new Date(input);
        }

        // Trường hợp input là object có thể chuyển đổi (ví dụ: Firestore Timestamp)
        if (typeof input === 'object' && input !== null && 'toDate' in input) {
            return (input as { toDate: () => Date }).toDate();
        }

        return undefined;
    } catch (error) {
        console.error('Lỗi chuyển đổi ngày tháng:', error);
        return undefined;
    }
}