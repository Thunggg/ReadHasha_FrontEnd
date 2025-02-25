import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { resendOTP, verifyEmail } from "@/services/api";
import { useNavigate } from 'react-router-dom';
import "./verifyEmail.scss";

type VerifyEmailForm = {
    otp: string;
};

const VerifyEmail = () => {
    const [loading, setLoading] = useState(false); // ✅ Đặt trong function component
    const [resendLoading, setResendLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: VerifyEmailForm) => {
        setLoading(true);

        try {
            const res = await verifyEmail(values.otp);
            console.log(res);
            if (res && res.statusCode === 200) {
                message.success("Xác thực email thành công!");
                localStorage.clear(); // Xóa dữ liệu localStorage nếu cần
                navigate("/login"); // Chỉ chuyển hướng khi xác thực thành công
            } else {
                message.error(res.message || "Xác thực thất bại!");
                // Không chuyển hướng nếu xác thực thất bại
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi hệ thống!");
            // Không chuyển hướng nếu có lỗi
        } finally {
            setLoading(false); // Đảm bảo tắt trạng thái loading
        }
    };

    const onResendOTP = async () => {
        setResendLoading(true);
        try {

            const res = await resendOTP();
            if (res && res.statusCode === 200) {
                message.success("Mã OTP đã được gửi lại đến email của bạn!");
            } else {
                message.error(res.data.message || "Gửi lại mã OTP thất bại!");
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi hệ thống!");
        }
        setResendLoading(false);
    };

    return (
        <div className="verify-email-container">
            <h2>Xác nhận Email</h2>
            <p>Nhập mã OTP đã gửi đến email của bạn.</p>

            <Form name="verify-email" className="verify-form" onFinish={onFinish} autoComplete="off">
                <Form.Item<VerifyEmailForm>
                    name="otp"
                    rules={[{ required: true, message: "Vui lòng nhập mã OTP!" }]}
                >
                    <Input className="otp-input" placeholder="Nhập mã OTP" maxLength={6} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="submit-btn" loading={loading}>
                        Xác nhận
                    </Button>
                </Form.Item>

                {/* Nút gửi lại mã OTP */}
                <Button type="link" onClick={onResendOTP} loading={resendLoading}>
                    Gửi lại mã OTP
                </Button>
            </Form>
        </div>
    );
};

export default VerifyEmail;
