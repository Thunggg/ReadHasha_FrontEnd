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
            console.log("Access Token:", accessToken);
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

    return axios.post(urlBackend, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
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