import axios from "services/axios.customize";

export const registerAPI = async (registerData: any) => {
    const urlBackend = "/api/v1/accounts/register";

    const formData = new FormData();
    formData.append("register", JSON.stringify(registerData));

    const response = await axios.post<IBackendRes<{ accessToken: string, refreshToken: string }>>(urlBackend, formData);

    if (response && response.data) {
        const accessToken = response.access_token;
        console.log(accessToken)
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

export const fetchAccountAPI = () => {
    const urlBackend = "/api/v1/accounts/fetch-account";
    return axios.get<IBackendRes<IUser>>(urlBackend);
}

export const logoutAPI = () => {
    const urlBackend = "/api/auth/logout";
    return axios.post<IBackendRes<null>>(urlBackend);
}