/**
 * Cấu hình API cho ứng dụng
 * Cho phép dễ dàng chuyển đổi giữa backend SQL và JSON
 */

// Đặt thành 'json' để sử dụng database JSON, hoặc 'sql' để sử dụng backend SQL
export const API_TYPE = 'json';

// Thông báo cấu hình API
console.log(`[Config] Sử dụng ${API_TYPE === 'json' ? 'JSON Database' : 'SQL Backend'}`);

export default {
    API_TYPE
}; 