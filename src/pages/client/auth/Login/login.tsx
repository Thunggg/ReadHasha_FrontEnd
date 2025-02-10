import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import './login.scss';

const onFinish: FormProps<{ username?: string; password?: string; remember?: boolean }>["onFinish"] = (values) => {
    console.log('Success:', values);
};

const onFinishFailed: FormProps<{ username?: string; password?: string; remember?: boolean }>["onFinishFailed"] = (errorInfo) => {
    console.log('Failed:', errorInfo);
};

const LoginPage = () => (
    <div className="login-container">
        <div className="login-box">
            <Form
                name="basic"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
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

                <Form.Item name="remember" valuePropName="checked">
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
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
);

export default LoginPage;
