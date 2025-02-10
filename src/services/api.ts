import axios from "services/axios.customize";

export const registerAPI = (registerData: any) => {
    const urlBackend = "/api/v1/accounts/register";

    // Tạo FormData và append dữ liệu JSON vào
    const formData = new FormData();
    formData.append("register", JSON.stringify(registerData));

    return axios.post<IBackendRes<IRegister>>(urlBackend, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};
