import { App, Button, Col, Form, Input, Row, Typography } from "antd";
import { useState } from "react";
import type { FormProps } from 'antd';
import { updatePasswordAPI } from "services/api";

const { Title } = Typography;

type FieldType = {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
};

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { message, notification } = App.useApp();

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { oldPassword, newPassword } = values;
        setIsSubmitting(true);

        try {
            // Gọi API đổi mật khẩu
            const res = await updatePasswordAPI({ oldPassword, newPassword });
            if (res.statusCode === 200) {
                // Thông báo thành công
                message.success("Đổi mật khẩu thành công!");
                form.resetFields();
            } else {
                notification.error({
                    message: "Lỗi cập nhật",
                    description: res.message
                });
            }

        } catch (error: any) {
            // Xử lý lỗi
            notification.error({
                message: "Lỗi đổi mật khẩu",
                description: error.response?.data?.message || "Đã xảy ra lỗi khi đổi mật khẩu",
            });
        } finally {
            setIsSubmitting(false);
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
                                loading={isSubmitting}
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