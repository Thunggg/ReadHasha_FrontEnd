import { useCurrentApp } from "@/components/context/app.context";
import { App, Button, Col, Form, Input, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import type { FormProps } from 'antd';

const { Title } = Typography;

type FieldType = {
    email: string;
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const { user } = useCurrentApp();
    const { message, notification } = App.useApp();

    useEffect(() => {
        if (user) {
            form.setFieldValue("email", user.email);
        }
    }, [user]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { email, oldPassword, newPassword } = values;
        setIsSubmit(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/accounts/update-user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    username: user?.username,
                    oldPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Có lỗi xảy ra khi cập nhật mật khẩu");
            }

            message.success("Cập nhật mật khẩu thành công");
            form.resetFields(["oldPassword", "newPassword", "confirmPassword"]);
        } catch (error) {
            notification.error({
                message: "Lỗi cập nhật mật khẩu",
                description: error instanceof Error ? error.message : "Lỗi không xác định"
            });
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <div style={{ minHeight: 400, padding: 24 }}>
            <Row justify="center">
                <Col xs={24} sm={20} md={16} lg={12}>
                    <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
                        Đổi mật khẩu
                    </Title>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ remember: true }}
                    >
                        <Form.Item<FieldType>
                            label="Email"
                            name="email"
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Mật khẩu hiện tại"
                            name="oldPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu hiện tại' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('oldPassword') !== value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu mới không được trùng với mật khẩu cũ'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Xác nhận mật khẩu mới"
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmit}
                                block
                                size="large"
                            >
                                Đổi mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default ChangePassword;