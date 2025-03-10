import { Button, Form, Input, message, notification, theme } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { resetPasswordAPI } from '@/services/api';
import './resetPassword.scss';
import { useState } from 'react';

type ResetPasswordForm = {
    newPassword: string;
    confirmPassword: string;
};

const ResetPassword = () => {
    const { token } = theme.useToken();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: ResetPasswordForm) => {
        setLoading(true);
        try {
            // Gọi API reset password
            const accessToken = localStorage.getItem("access_token");
            if (accessToken == "" || accessToken == null) {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: "Bạn chưa xác thực otp hoặc chưa xác thực email!"
                })
            } else {
                const res = await resetPasswordAPI(values.newPassword);
                console.log(res)
                if (res.statusCode === 200) {
                    message.success('Đặt lại mật khẩu thành công!');
                    localStorage.removeItem('resetEmail');
                    navigate('/login');
                } else {
                    notification.error({
                        message: 'Đã có lỗi xảy ra',
                        description: res.message
                    })
                }
            }
        } catch (error) {
            message.error('Đặt lại mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container" style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div className="auth-card" style={{
                background: token.colorBgContainer,
                borderRadius: '20px',
                padding: '48px 40px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="decorative-line" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: token.colorPrimary
                }} />

                <KeyOutlined style={{
                    fontSize: '56px',
                    color: token.colorPrimary,
                    marginBottom: '32px',
                    display: 'inline-block',
                    padding: '16px',
                    borderRadius: '50%',
                    background: token.colorPrimaryBg,
                    transform: 'rotate(-45deg)'
                }} />

                <h1 style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    marginBottom: '24px',
                    color: token.colorTextHeading,
                    letterSpacing: '-0.5px'
                }}>
                    Đặt Lại Mật Khẩu
                </h1>

                <Form
                    form={form}
                    name="reset-password"
                    onFinish={onFinish}
                    layout="vertical"
                    autoComplete="off"
                >
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="Nhập mật khẩu mới"
                            style={{
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '16px'
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="Nhập lại mật khẩu"
                            style={{
                                borderRadius: '12px',
                                padding: '12px 16px',
                                fontSize: '16px'
                            }}
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            style={{
                                height: '52px',
                                fontWeight: 600,
                                fontSize: '16px',
                                borderRadius: '12px',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 6px rgba(22, 119, 255, 0.2)',
                                marginTop: '16px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(22, 119, 255, 0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(22, 119, 255, 0.2)';
                            }}
                        >
                            Đặt Lại Mật Khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default ResetPassword;