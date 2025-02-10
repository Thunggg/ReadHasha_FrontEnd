import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { verifyEmail } from "@/services/api";
import { useNavigate } from 'react-router-dom';
import "./verifyEmail.scss";

type VerifyEmailForm = {
    otp: string;
};

const VerifyEmail = () => {
    const [loading, setLoading] = useState(false); // ✅ Đặt trong function component
    const navigate = useNavigate();
    const onFinish = async (values: VerifyEmailForm) => {
        setLoading(true);

        try {
            const res = await verifyEmail(values.otp);
            console.log(res);
            if (res && res.statusCode === 200) {
                message.success("Xác thực email thành công!");
            } else {
                message.error(res.data.message || "Xác thực thất bại!");
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || "Lỗi hệ thống!");
        }
        setLoading(false);
        localStorage.clear();
        navigate("/login");
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
            </Form>
        </div>
    );
};

export default VerifyEmail;
