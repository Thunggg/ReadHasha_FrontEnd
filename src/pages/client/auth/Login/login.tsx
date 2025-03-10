import type { FormProps } from 'antd';
import { Button, Form, Input, message, Modal, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './login.scss';
import { useState } from 'react';
import { LoginAPI, resendOTP } from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';

type LoginFormType = {
    username: string;
    password: string;
};



const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingVerify, setLoadingVerify] = useState<boolean>(false);
    const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(null);
    const { setIsAuthenticated, setUser } = useCurrentApp();

    const onFinish: FormProps<LoginFormType>["onFinish"] = async (values) => {
        setLoading(true);
        try {
            const res = await LoginAPI(values.username, values.password);

            console.log(">>>>>>>>>>>> RES:", res);
            if (res && res.statusCode == 1051 || res && res.statusCode == 1052) {
                notification.error({
                    message: "Đăng nhập thất bại",
                    description: res.message,
                    duration: 5
                });
            }
            else if (res && res.statusCode == 403) {
                notification.error({
                    message: "Đăng nhập thất bại",
                    description: res.message,
                    duration: 5
                });
                setShowVerifyModal(true);
                setToken(res.access_token || null);
            }
            else {
                if (res.statusCode == 200) {
                    setIsAuthenticated(true);
                    setUser(res?.data?.account!);
                    localStorage.setItem("access_token", res.data?.accessToken ?? "");
                    message.success("Đăng nhập tài khoản thành công!");
                    navigate("/");
                }
            }
        } catch (error: any) {
            // Kiểm tra nếu API trả về lỗi
            notification.error({
                message: "Đăng nhập thất bại",
                description:
                    "Đã có lỗi xảy ra!",
                duration: 5
            });
        } finally {
            setLoading(false); // Tắt loading sau khi hoàn tất
        }

    };

    return (
        <>
            <div className="login-container">
                <div className="login-box">
                    <Form
                        name="basic"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                    >
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[{ required: true, message: 'Please input your username!' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                    <div className="register-link">
                        <span>Chưa có tài khoản? </span>
                        <Link to="/register">Đăng ký</Link>
                    </div>
                    <div className="forgot-password-link" style={{ textAlign: "center", marginTop: 10 }}>
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>
                </div>
            </div>

            {/* Modal Xác Nhận Email */}
            <Modal
                title="📧 Xác Thực Email"
                open={showVerifyModal}
                onCancel={() => setShowVerifyModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowVerifyModal(false)}>
                        Hủy
                    </Button>,
                    <Button key="verify" type="primary" onClick={async () => {
                        setLoadingVerify(true);
                        localStorage.setItem("access_token", token ?? "");
                        await resendOTP();
                        setLoadingVerify(false);
                        navigate("/register/verifyEmail");
                    }}
                        loading={loadingVerify}
                    >
                        Xác Thực Ngay
                    </Button>,
                ]}
            >
                <p>Bạn cần xác thực email trước khi tiếp tục.</p>
            </Modal>
        </>
    )
};

export default LoginPage;
