/* eslint-disable @typescript-eslint/no-explicit-any */
import { jsonUtils } from './api-wrapper';

// Ghi dữ liệu vào db.json
const writeDB = async (data: any) => {
    // Trong một ứng dụng thực tế, bạn cần sử dụng Node.js hoặc các công cụ khác để ghi file
    // Trong môi trường trình duyệt, chúng ta mô phỏng việc lưu trữ
    console.log('Ghi dữ liệu mới vào DB:', data);
    // Ở đây, bạn có thể sử dụng localStorage hoặc IndexedDB để lưu trữ tạm thời
    localStorage.setItem('readhasha_db', JSON.stringify(data));
    return data;
};

// Mô phỏng backend response
const mockResponse = (data: any, message = 'Thành công', statusCode = 200) => {
    return {
        data,
        message,
        statusCode
    };
};

// ****************************************** AUTH ******************************************
export const registerAPI = async (registerData: any) => {
    const database = jsonUtils.getSavedDB();

    // Kiểm tra username đã tồn tại chưa
    const userExists = database.accounts.some((account: any) =>
        account.username === registerData.username || account.email === registerData.email
    );

    if (userExists) {
        return {
            error: 'Username hoặc email đã tồn tại',
            message: 'Đăng ký thất bại',
            statusCode: 400
        };
    }

    // Tạo user mới
    const newUser = {
        ...registerData,
        role: 0, // Mặc định là user thường
        accStatus: 0, // Chưa xác thực
        code: `USER${Date.now()}` // Tạo code ngẫu nhiên
    };

    // Thêm vào database
    database.accounts.push(newUser);
    await writeDB(database);

    // Tạo giả lập token
    const accessToken = `fake_access_token_${Date.now()}`;
    localStorage.setItem('access_token', accessToken);

    return {
        message: 'Đăng ký thành công',
        statusCode: 201,
        access_token: accessToken,
        refresh_token: `fake_refresh_token_${Date.now()}`
    };
};

export const verifyEmail = async (otp: string) => {
    const database = jsonUtils.getSavedDB();
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error("Không tìm thấy token! Vui lòng đăng nhập lại.");
    }

    // Trong môi trường thực tế, bạn sẽ giải mã token để lấy thông tin người dùng
    // Ở đây, chúng ta giả định rằng OTP hợp lệ là "123456"
    if (otp !== "123456") {
        return {
            error: 'Mã OTP không hợp lệ',
            message: 'Xác thực email thất bại',
            statusCode: 400
        };
    }

    // Tìm user hiện tại (giả định)
    const currentUsername = database.accounts[database.accounts.length - 1].username;
    const userIndex = database.accounts.findIndex((acc: any) => acc.username === currentUsername);

    if (userIndex !== -1) {
        // Cập nhật trạng thái tài khoản thành đã xác thực
        database.accounts[userIndex].accStatus = 1;
        await writeDB(database);

        return {
            message: 'Xác thực email thành công',
            statusCode: 200
        };
    }

    return {
        error: 'Không tìm thấy tài khoản',
        message: 'Xác thực email thất bại',
        statusCode: 404
    };
};

export const loginAPI = async (loginData: any) => {
    const database = jsonUtils.getSavedDB();

    // Tìm tài khoản
    const user = database.accounts.find((acc: any) =>
        acc.username === loginData.username && acc.password === loginData.password
    );

    if (!user) {
        return {
            error: 'Tên đăng nhập hoặc mật khẩu không chính xác',
            message: 'Đăng nhập thất bại',
            statusCode: 401
        };
    }

    // Kiểm tra tài khoản đã xác thực chưa
    if (user.accStatus !== 1) {
        return {
            error: 'Tài khoản chưa được xác thực email',
            message: 'Đăng nhập thất bại',
            statusCode: 403
        };
    }

    // Tạo giả lập token
    const accessToken = `fake_access_token_${Date.now()}`;
    localStorage.setItem('access_token', accessToken);

    return {
        message: 'Đăng nhập thành công',
        statusCode: 200,
        data: {
            account: user,
            authenticate: true,
            accessToken,
            refreshToken: `fake_refresh_token_${Date.now()}`
        }
    };
};

// ****************************************** ACCOUNT ******************************************
export const fetchAccountAPI = () => {
    const database = jsonUtils.getSavedDB();
    const token = localStorage.getItem('access_token');

    if (!token) {
        return {
            error: 'Không tìm thấy token',
            message: 'Chưa đăng nhập',
            statusCode: 401
        };
    }

    // Trong môi trường thực tế, bạn sẽ giải mã token để lấy username
    // Ở đây, chúng ta lấy user mẫu từ database
    const user = database.accounts[0]; // Giả định user đầu tiên

    // Lấy giỏ hàng của user này
    const userCarts = database.carts.filter((cart: any) => cart.username === user.username);

    // Chuyển đổi giỏ hàng sang định dạng phù hợp
    const cartCollection = userCarts.map((cart: any) => {
        const book = database.books.find((b: any) => b.bookID === cart.bookID);
        return {
            cartID: cart.cartID,
            quantity: cart.quantity,
            bookID: book
        };
    });

    return mockResponse({
        ...user,
        cartCollection
    });
};

export const getUserAPI = () => {
    const database = jsonUtils.getSavedDB();

    // Mô phỏng phân trang đơn giản
    // Trong thực tế, bạn sẽ phân tích query string để lọc và phân trang
    const pageSize = 10;
    const current = 1;

    return mockResponse({
        meta: {
            current,
            pageSize,
            pages: Math.ceil(database.accounts.length / pageSize),
            total: database.accounts.length
        },
        result: database.accounts.slice(0, pageSize)
    });
};

// ****************************************** BOOKS ******************************************
export const getBookAPI = () => {
    const database = jsonUtils.getSavedDB();

    // Mô phỏng phân trang đơn giản
    const pageSize = 10;
    const current = 1;

    // Kết hợp books với categories
    const booksWithCategories = database.books.map((book: any) => {
        const bookCategories = database.book_categories
            .filter((bc: any) => bc.book_id === book.bookID)
            .map((bc: any) => {
                const category = database.categories.find((cat: any) => cat.catID === bc.cat_id);
                return {
                    bookCateId: bc.book_cate_id,
                    catId: category
                };
            });

        return {
            ...book,
            bookCategories
        };
    });

    return mockResponse({
        meta: {
            current,
            pageSize,
            pages: Math.ceil(booksWithCategories.length / pageSize),
            total: booksWithCategories.length
        },
        result: booksWithCategories.slice(0, pageSize)
    });
};

export const getBookByIdAPI = (id: number) => {
    const database = jsonUtils.getSavedDB();

    const book = database.books.find((b: any) => b.bookID === id);

    if (!book) {
        return {
            error: 'Không tìm thấy sách',
            message: 'Không tìm thấy sách',
            statusCode: 404
        };
    }

    // Kết hợp với categories
    const bookCategories = database.book_categories
        .filter((bc: any) => bc.book_id === book.bookID)
        .map((bc: any) => {
            const category = database.categories.find((cat: any) => cat.catID === bc.cat_id);
            return {
                bookCateId: bc.book_cate_id,
                catId: category
            };
        });

    return mockResponse({
        ...book,
        bookCategories
    });
};

// ****************************************** CATEGORIES ******************************************
export const getCategoryAPI = () => {
    const database = jsonUtils.getSavedDB();

    return mockResponse({
        categories: database.categories
    });
};

// ****************************************** CART ******************************************
export const addToCartAPI = (cartData: any) => {
    const database = jsonUtils.getSavedDB();
    const { username, bookID, quantity } = cartData;

    // Kiểm tra xem đã có trong giỏ hàng chưa
    const existingCartIndex = database.carts.findIndex(
        (cart: any) => cart.username === username && cart.bookID === bookID
    );

    if (existingCartIndex !== -1) {
        // Cập nhật số lượng
        database.carts[existingCartIndex].quantity += quantity;
    } else {
        // Thêm mới vào giỏ hàng
        const newCartID = database.carts.length > 0
            ? Math.max(...database.carts.map((c: any) => c.cartID)) + 1
            : 1;

        database.carts.push({
            cartID: newCartID,
            username,
            bookID,
            quantity
        });
    }

    writeDB(database);

    return mockResponse({
        message: 'Thêm vào giỏ hàng thành công'
    });
};

// ****************************************** ORDERS ******************************************
export const createOrderAPI = (orderData: any) => {
    const database = jsonUtils.getSavedDB();
    const { username, address, details, promotionID } = orderData;

    // Tạo ID mới cho đơn hàng
    const newOrderID = database.orders.length > 0
        ? Math.max(...database.orders.map((o: any) => o.orderID)) + 1
        : 1;

    // Tạo đơn hàng mới
    const newOrder = {
        orderID: newOrderID,
        proID: promotionID || null,
        username,
        orderDate: new Date().toISOString(),
        orderAddress: address,
        orderStatus: 0 // Trạng thái mới
    };

    database.orders.push(newOrder);

    // Tạo chi tiết đơn hàng
    let totalAmount = 0;

    details.forEach((detail: any) => {
        const book = database.books.find((b: any) => b.bookID === detail.bookId);

        if (book) {
            const newDetailID = database.order_details.length > 0
                ? Math.max(...database.order_details.map((od: any) => od.ODID)) + 1
                : 1;

            const detailPrice = book.bookPrice * detail.quantity;
            totalAmount += detailPrice;

            database.order_details.push({
                ODID: newDetailID,
                bookID: detail.bookId,
                orderID: newOrderID,
                quantity: detail.quantity,
                totalPrice: detailPrice
            });

            // Cập nhật số lượng sách
            const bookIndex = database.books.findIndex((b: any) => b.bookID === detail.bookId);
            if (bookIndex !== -1) {
                database.books[bookIndex].bookQuantity -= detail.quantity;
            }
        }
    });

    // Xóa giỏ hàng sau khi đặt hàng
    database.carts = database.carts.filter((cart: any) => cart.username !== username);

    writeDB(database);

    return mockResponse({
        orderID: newOrderID,
        totalAmount
    });
};

export const getOrderHistoryAPI = (username: string) => {
    const database = jsonUtils.getSavedDB();

    // Lấy đơn hàng của user
    const userOrders = database.orders.filter((order: any) => order.username === username);

    // Kết hợp với chi tiết đơn hàng
    const orderHistory = userOrders.map((order: any) => {
        const orderDetails = database.order_details
            .filter((detail: any) => detail.orderID === order.orderID)
            .map((detail: any) => {
                const book = database.books.find((b: any) => b.bookID === detail.bookID);
                return {
                    odid: detail.ODID,
                    quantity: detail.quantity,
                    totalPrice: detail.totalPrice,
                    bookID: {
                        bookID: book.bookID,
                        bookTitle: book.bookTitle,
                        author: book.author,
                        bookPrice: book.bookPrice
                    }
                };
            });

        return {
            orderID: order.orderID,
            orderDate: order.orderDate,
            orderStatus: order.orderStatus,
            orderAddress: order.orderAddress,
            customerName: username,
            orderDetailList: orderDetails
        };
    });

    return mockResponse(orderHistory);
};

// ****************************************** PROMOTIONS ******************************************
export const getPromotionAPI = () => {
    const database = jsonUtils.getSavedDB();

    return mockResponse(database.promotions);
};

export const validatePromotionAPI = (code: string) => {
    const database = jsonUtils.getSavedDB();

    const promotion = database.promotions.find(
        (promo: any) => promo.proCode === code && promo.proStatus === 1
    );

    if (!promotion) {
        return {
            error: 'Mã khuyến mãi không hợp lệ',
            message: 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn',
            statusCode: 404
        };
    }

    // Kiểm tra còn thời hạn không
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    if (now < startDate || now > endDate) {
        return {
            error: 'Mã khuyến mãi hết hạn',
            message: 'Mã khuyến mãi không trong thời gian hiệu lực',
            statusCode: 400
        };
    }

    // Kiểm tra còn số lượng không
    if (promotion.quantity <= 0) {
        return {
            error: 'Mã khuyến mãi đã hết lượt sử dụng',
            message: 'Mã khuyến mãi đã hết lượt sử dụng',
            statusCode: 400
        };
    }

    return mockResponse(promotion);
};

// Export tất cả các API
export default {
    registerAPI,
    verifyEmail,
    loginAPI,
    fetchAccountAPI,
    getUserAPI,
    getBookAPI,
    getBookByIdAPI,
    getCategoryAPI,
    addToCartAPI,
    createOrderAPI,
    getOrderHistoryAPI,
    getPromotionAPI,
    validatePromotionAPI
}; 