import { useCurrentApp } from "@/components/context/app.context";
import { AntDesignOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Col, Form, Input, Row, DatePicker, Select } from "antd";
import { useEffect, useState } from "react";
import type { FormProps } from 'antd';
import { updateUserAPI } from "@/services/api"; // Import API đã viết sẵn
import dayjs from 'dayjs'; // Xử lý ngày tháng

const { Option } = Select;

type FieldType = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    dob?: dayjs.Dayjs; // Sử dụng dayjs để xử lý ngày tháng
    sex?: number;
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
                address: user.address,
                dob: user.dob ? dayjs(user.dob) : undefined, // Chuyển đổi ngày tháng
                sex: user.sex
            });
        }
    }, [user]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        try {
            setIsSubmit(true);

            const updateData = {
                username: values.username,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                address: values.address,
                dob: values.dob ? values.dob.toDate() : undefined, // Chuyển đổi ngày tháng
                sex: values.sex,
                email: user!.email // Thêm email từ context
            };

            // Gọi API đã được định nghĩa sẵn
            const res = await updateUserAPI(updateData);

            if (res.data && res.statusCode === 200) {
                // Cập nhật context với dữ liệu mới từ server
                setUser({
                    ...user!,
                    ...res.data
                });

                message.success("Cập nhật thông tin thành công");
            } else {
                notification.error({
                    message: "Lỗi cập nhật",
                    description: res.message
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi cập nhật",
                description: error.response?.data?.message || "Lỗi không xác định"
            });
        } finally {
            setIsSubmit(false);
        }
    };

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

                        <Form.Item<FieldType>
                            label="Ngày sinh"
                            name="dob"
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Giới tính"
                            name="sex"
                        >
                            <Select>
                                <Option value={0}>Nam</Option>
                                <Option value={1}>Nữ</Option>
                            </Select>
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
    );
};

export default UserInfo;