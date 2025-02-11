import type { FormProps } from 'antd';
import { Button, Form, Input, message, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import './login.scss';
import { useState } from 'react';
import { LoginAPI } from '@/services/api';

type LoginFormType = {
    username: string;
    password: string;
};



const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish: FormProps<LoginFormType>["onFinish"] = async (values) => {
        setLoading(true);
        try {
            const res = await LoginAPI(values.username, values.password);

            if (res && res.statusCode == 401) {
                notification.error({
                    message: "Đăng nhập thất bại",
                    description: res.message,
                    duration: 5
                });
                return;
            }

            console.log(res);
            if (res) {
                if (res.statusCode == 200) {
                    localStorage.setItem("access_token", res.access_token ?? "");
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
                </div>
            </div>
        </>
    )
};

export default LoginPage;
