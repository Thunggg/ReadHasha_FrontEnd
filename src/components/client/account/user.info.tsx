import { useCurrentApp } from "@/components/context/app.context";
import { AntDesignOutlined, UploadOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Col, Form, Input, Row } from "antd";
import { useEffect, useState } from "react";
import type { FormProps } from 'antd';

type FieldType = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
};

const UserInfo = () => {
    const [form] = Form.useForm();
    const { user, setUser } = useCurrentApp();
    const [isSubmit, setIsSubmit] = useState(false);
    const { message, notification } = App.useApp();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                address: user.address
            })
        }
    }, [user])

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        try {
            setIsSubmit(true);
            const updateData = {
                username: values.username,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                address: values.address
            };

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/accounts/update-user`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) throw new Error(await response.text());

            // Update context
            setUser({
                ...user!,
                ...updateData
            });

            message.success("Cập nhật thông tin thành công");
        } catch (error) {
            notification.error({
                message: "Lỗi cập nhật",
                description: error instanceof Error ? error.message : "Lỗi không xác định"
            });
        } finally {
            setIsSubmit(false);
        }
    }

    return (
        <div style={{ minHeight: 400, padding: 20 }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center' }}>
                        <Avatar
                            size={160}
                            icon={<AntDesignOutlined />}
                            style={{ backgroundColor: '#1890ff' }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <h3>{user?.username}</h3>
                            <p>{user?.email}</p>
                        </div>
                    </div>
                </Col>

                <Col xs={24} md={16}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ remember: true }}
                    >
                        <Form.Item<FieldType>
                            label="Username"
                            name="username"
                            hidden
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Email"
                            name="email"
                        >
                            <Input disabled />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Họ"
                                    name="lastName"
                                    rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item<FieldType>
                                    label="Tên"
                                    name="firstName"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item<FieldType>
                            label="Số điện thoại"
                            name="phone"
                            rules={[{ pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Địa chỉ"
                            name="address"
                        >
                            <Input.TextArea />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSubmit}
                            >
                                Cập nhật thông tin
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </div>
    )
}

export default UserInfo;