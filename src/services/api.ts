/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "services/axios.customize";

// ****************************************** AUTH ******************************************
export const registerAPI = async (registerData: any) => {
    const urlBackend = "/api/v1/accounts/register";

    const formData = new FormData();
    formData.append("register", JSON.stringify(registerData));

    const response = await axios.post<IBackendRes<{ accessToken: string, refreshToken: string }>>(urlBackend, formData);

    if (response && response.data) {
        const accessToken = response.access_token;
        if (accessToken) {
            localStorage.setItem("access_token", accessToken);

            // Store OTP expiration time (5 minutes from now)
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 5);
            localStorage.setItem("otp_expiration", expirationTime.toISOString());
        }
    } else {
        console.warn("Backend không trả về token hợp lệ!");
    }

    return response;
};

export const verifyEmail = async (otp: string) => {
    const urlBackend = "/api/v1/accounts/email/verify";

    const token = localStorage.getItem("access_token");
    if (!token) {
        throw new Error("Không tìm thấy token! Vui lòng đăng nhập lại.");
    }

    // Check if OTP has expired
    const expirationTimeStr = localStorage.getItem("otp_expiration");
    if (expirationTimeStr) {
        const expirationTime = new Date(expirationTimeStr);
        const currentTime = new Date();

        if (currentTime > expirationTime) {
            // OTP has expired
            return {
                statusCode: 400,
                message: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.",
                data: null,
                error: "OTP_EXPIRED"
            };
        }
    }

    return axios.post(urlBackend, { otp }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const resendOTP = async () => {
    const urlBackend = "/api/v1/accounts/email/resend-otp"; // URL backend để gửi lại OTP
    const token = localStorage.getItem("access_token"); // Lấy token từ localStorage

    if (!token) {
        throw new Error("Không tìm thấy token! Vui lòng thử đăng ký lại!");
    }

    const response = await axios.post(urlBackend, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response && response.statusCode === 200) {
        // Reset OTP expiration time (5 minutes from now)
        const expirationTime = new Date();
        expirationTime.setMinutes(expirationTime.getMinutes() + 5);
        localStorage.setItem("otp_expiration", expirationTime.toISOString());
    }

    return response;
};

export const LoginAPI = async (username: string, password: string) => {
    const urlBackend = "/api/auth/login";

    // Tạo FormData để gửi dữ liệu theo yêu cầu của backend
    const formData = new FormData();
    formData.append("login", JSON.stringify({ username, password }));

    return axios.post<IBackendRes<ILogin>>(urlBackend, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const logoutAPI = () => {
    const urlBackend = "/api/auth/logout";
    return axios.post<IBackendRes<null>>(urlBackend);
}

export const updatePasswordAPI = async (data: {
    oldPassword: string;
    newPassword: string;
}) => {
    const urlBackend = "/api/v1/accounts/update-password";
    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("Không tìm thấy token! Vui lòng đăng nhập lại.");
    }

    return axios.post<IBackendRes<IUser>>(urlBackend, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const checkEmailExists = (email: string) => {
    const urlBackend = `/api/v1/accounts/check-email?email=${email}`;
    return axios.get<IBackendRes<IUser>>(urlBackend);
}

export const sendVerificationOTP = (email: string) => {
    const urlBackend = `/api/v1/accounts/email/send-otp`;
    return axios.post<IBackendRes<IUser>>(urlBackend, { email },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    ).then(response => {
        if (response.data && response.data.statusCode === 200) {
            // Store OTP expiration time (5 minutes from now)
            const expirationTime = new Date();
            expirationTime.setMinutes(expirationTime.getMinutes() + 5);
            localStorage.setItem("otp_expiration", expirationTime.toISOString());
        }
        return response.data;
    });
}

export const resetPasswordAPI = (newPassword: string) => {
    const urlBackend = `/api/v1/accounts/reset-password`;

    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("Không tìm thấy token!");
    }

    return axios.post<IBackendRes<IUser>>(urlBackend, { newPassword },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

}

// ****************************************** ACCOUNT ******************************************

export const fetchAccountAPI = () => {
    const urlBackend = "/api/v1/accounts/fetch-account";
    return axios.get<IBackendRes<IUser>>(urlBackend);
}

export const getUserAPI = (query: string) => {
    const urlBackend = `/api/v1/accounts/account-pagination?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IUser>>>(urlBackend);
}

export const deleteUserAPI = (userName: string) => {
    const urlBackend = `/api/v1/accounts/delete-user?username=${userName}`;
    return axios.delete<IBackendRes<IRegister>>(urlBackend);
}

export const updateUserAPI = (updateData: UpdateUserRequest) => {
    const urlBackend = `/api/v1/accounts/update-user`;
    return axios.put<IBackendRes<IUser>>(urlBackend, updateData);
}

// ****************************************** Book ******************************************
export const getBookAPI = (query: string) => {
    const urlBackend = `/api/v1/books/book-pagination?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IBook>>>(urlBackend);
}

// ****************************************** Category ******************************************
export const getCategoryAPI = () => {
    const urlBackend = `/api/v1/categories/`;
    return axios.get<IBackendRes<ICategoryGetAll<ICategory>>>(urlBackend);
}

export const createBookAPI = (formData: FormData) => {
    return axios.post<IBackendRes<IBook>>('/api/v1/books/add-book', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteBookAPI = (bookID: number) => {
    return axios.delete<IBackendRes<IBook>>(`/api/v1/books/delete-book/${bookID}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }
    });
};

export const updateBookAPI = (formData: FormData) => {
    return axios.put<IBackendRes<IBook>>(
        '/api/v1/books/update-book', // Khớp với endpoint backend
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('access_token')}`
            }
        }
    );
};

export const getBooksByCategoryAPI = (categoryIds: string) => {
    const urlBackend = `/api/v1/categories/books-by-category?categoryIds=${categoryIds}`;
    return axios.get<IBackendRes<IBook[]>>(urlBackend);
};

export const getBooksByIdAPI = (BookID: string) => {
    const urlBackend = `/api/v1/books/${BookID}`;
    return axios.get<IBackendRes<IBook>>(urlBackend);
};

export const getCategoryPaginationAPI = (query: string) => {
    const urlBackend = `/api/v1/categories/category-pagination?${query}`;
    return axios.get<IBackendRes<IModelPaginate<ICategory>>>(urlBackend);
}

export const createCategoryAPI = (data: ICategory) => {
    const urlBackend = `/api/v1/categories/`;
    return axios.post<IBackendRes<ICategory>>(urlBackend, data);
};

export const updateCategoryAPI = (data: ICategory) => {
    const urlBackend = `/api/v1/categories/`;
    return axios.put<IBackendRes<ICategory>>(urlBackend, data);
};

export const deleteCategoryAPI = (id: number) => {
    const urlBackend = `/api/v1/categories/${id}`;
    return axios.delete<IBackendRes<ICategory>>(urlBackend);
};

// ****************************************** Order ******************************************
export const CreateOrderAPI = (orderData: IOrderRequest) => {
    const urlBackend = `/api/v1/orders/`;
    return axios.post<IBackendRes<{ orderId: number }>>(urlBackend, orderData);
};

export const getHistoryAPI = (username: string) => {
    const urlBackend = `/api/v1/orders/history?username=${username}`;
    return axios.get<IBackendRes<IHistory[]>>(urlBackend);
};

export const getOrderPaginationAPI = (query: string) => {
    const urlBackend = `/api/v1/orders/order-pagination?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IOrder>>>(urlBackend);
}

// ****************************************** Promotion ******************************************

export const getPromotionsAPI = () => {
    const urlBackend = `/api/v1/promotions/`;
    return axios.get<IBackendRes<IPromotion[]>>(urlBackend);
}

export const getUsedPromotionsAPI = (username: string) => {
    const urlBackend = `/api/v1/promotions/used/${username}`;
    return axios.get<IBackendRes<IPromotion[]>>(urlBackend);
}

export const getPromotionPaginationAPI = (query: string) => {
    const urlBackend = `/api/v1/promotions/promotion-pagination?${query}`;
    return axios.get<IBackendRes<IModelPaginate<IPromotion>>>(urlBackend);
}

export const createPromotionAPI = (data: IPromotion) => {
    const urlBackend = `/api/v1/promotions/create`;
    return axios.post<IBackendRes<IPromotion>>(urlBackend, data);
}

// Thêm hàm updatePromotionAPI vào file api.ts
export const updatePromotionAPI = async (data: any) => {
    try {
        const urlBackend = `/api/v1/promotions/update`;
        return axios.put<IBackendRes<IPromotion>>(urlBackend, data);
    } catch (error) {
        console.error('Error updating promotion:', error);
        return {
            statusCode: 500,
            message: 'Lỗi kết nối đến server'
        };
    }
};

// Thêm API để cập nhật trạng thái đơn hàng
export const updateOrderStatusAPI = (orderId: number, status: number) => {
    const urlBackend = `/api/v1/orders/update-status/${orderId}`;
    return axios.put(urlBackend, { status });
};

// API để hủy đơn hàng và khôi phục số lượng sách
export const cancelOrderAndRestoreStockAPI = (orderId: number) => {
    const urlBackend = `/api/v1/orders/${orderId}/cancel-and-restore`;
    return axios.post<IBackendRes<IOrder>>(urlBackend);
};

// API để admin xác nhận đơn hàng
export const approveOrderAPI = (orderId: number, username: string) => {
    const urlBackend = `/api/v1/orders/${orderId}/approve?username=${username}`;
    return axios.patch<IBackendRes<IOrder>>(urlBackend);
};

// Sửa lại hàm deletePromotionAPI
export const deletePromotionAPI = (proID: number, username: string) => {
    const urlBackend = `/api/v1/promotions/${proID}?username=${username}`; // Đúng endpoint
    return axios.delete<IBackendRes<IPromotion>>(urlBackend);
}

// ****************************************** Cart ******************************************
export const addBookToCartAPI = (username: string, bookID: number, quantity: number) => {
    const urlBackend = `/api/v1/cart/add?username=${username}&bookID=${bookID}&quantity=${quantity}`; // Đúng endpoint
    return axios.post<IBackendRes<ICart>>(urlBackend);
}

export const updateCartQuantityAPI = (username: string, bookID: number, quantity: number) => {
    const urlBackend = `/api/v1/cart/update?username=${username}&bookID=${bookID}&quantity=${quantity}`; // Đúng endpoint
    return axios.put<IBackendRes<ICart>>(urlBackend);
}

export const deleteBookFromCartAPI = (username: string, bookID: number) => {
    const urlBackend = `/api/v1/cart/delete?username=${username}&bookID=${bookID}`; // Đúng endpoint
    return axios.delete<IBackendRes<ICart>>(urlBackend);
}

// ****************************************** Payment ******************************************
export const processVNPayCallback = (queryParams: URLSearchParams) => {
    const urlBackend = `/api/payment/vnpay-payment-callback`;
    return axios.get<IBackendRes<any>>(urlBackend, {
        params: Object.fromEntries(queryParams)
    });
};


