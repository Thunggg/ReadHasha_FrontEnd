import axios from "services/axios.customize";

export const registerAPI = async (registerData: any) => {
    const urlBackend = "/api/v1/accounts/register";

    const formData = new FormData();
    formData.append("register", JSON.stringify(registerData));

    const response = await axios.post<IBackendRes<{ accessToken: string, refreshToken: string }>>(urlBackend, formData);

    console.log("Response từ Backend:", response);

    // Kiểm tra dữ liệu trả về từ backend
    if (response && response.data) {
        const accessToken = response.access_token; // Lấy token từ data
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

    const token = localStorage.getItem("access_token"); // Lấy token từ localStorage

    if (!token) {
        throw new Error("Không tìm thấy token! Vui lòng đăng nhập lại.");
    }

    return axios.post(urlBackend, { otp }, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};