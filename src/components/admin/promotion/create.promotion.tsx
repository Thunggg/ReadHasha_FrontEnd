import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message, notification, Space, Divider, Typography, Card, Row, Col, Tooltip } from 'antd';
import { createPromotionAPI } from '@/services/api';
import dayjs from 'dayjs';
import { PlusOutlined, InfoCircleOutlined, CalendarOutlined, PercentageOutlined, NumberOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';
import { useCurrentApp } from '@/components/context/app.context';

const { Option } = Select;
const { Title, Text } = Typography;

interface ICreatePromotionProps {
    openModalCreate: boolean;
    setOpenModalCreate: (value: boolean) => void;
    reloadTable: () => void;
}

const CreatePromotion: React.FC<ICreatePromotionProps> = ({
    openModalCreate,
    setOpenModalCreate,
    reloadTable,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useCurrentApp();

    const handleCancel = () => {
        form.resetFields();
        setOpenModalCreate(false);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Định dạng ngày tháng
            const formattedValues = {
                ...values,
                startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
                endDate: dayjs(values.endDate).format('YYYY-MM-DD'),
            };

            const res = await createPromotionAPI(formattedValues);
            if (res && res.statusCode === 201) {
                message.success('Tạo khuyến mãi thành công!');
                handleCancel();
                reloadTable();
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message || 'Không thể tạo khuyến mãi',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: 'Không thể tạo khuyến mãi',
            });
        } finally {
            setLoading(false);
        }
    };

    // Kiểm tra ngày kết thúc phải sau ngày bắt đầu
    const validateEndDate = (_: any, value: any) => {
        const startDate = form.getFieldValue('startDate');
        if (startDate && value && dayjs(value).isBefore(dayjs(startDate))) {
            return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu!'));
        }
        return Promise.resolve();
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlusOutlined style={{ color: '#1890ff' }} />
                    <Title level={4} style={{ margin: 0 }}>Tạo khuyến mãi mới</Title>
                </div>
            }
            open={openModalCreate}
            onCancel={handleCancel}
            footer={null}
            width={800}
            bodyStyle={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}
            centered
        >
            <Card bordered={false} className="promotion-form-card">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        createdBy: user?.username,
                        proStatus: 1,
                        discount: 10,
                        quantity: 100,
                    }}
                    requiredMark="optional"
                >
                    <Divider orientation="left">
                        <Space>
                            <TagOutlined />
                            <span>Thông tin cơ bản</span>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="proName"
                                label="Tên khuyến mãi"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên khuyến mãi!' },
                                    { max: 100, message: 'Tên khuyến mãi không được quá 100 ký tự!' },
                                ]}
                            >
                                <Input
                                    placeholder="Nhập tên khuyến mãi"
                                    prefix={<TagOutlined className="site-form-item-icon" />}
                                    suffix={
                                        <Tooltip title="Tên khuyến mãi sẽ hiển thị cho người dùng">
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="proCode"
                                label="Mã khuyến mãi"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã khuyến mãi!' },
                                    { max: 20, message: 'Mã khuyến mãi không được quá 20 ký tự!' },
                                ]}
                            >
                                <Input
                                    placeholder="Nhập mã khuyến mãi"
                                    style={{ textTransform: 'uppercase' }}
                                    prefix={<TagOutlined className="site-form-item-icon" />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="proStatus"
                                label="Trạng thái"
                                rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Option value={1}>
                                        <Text type="success">Active</Text>
                                    </Option>
                                    <Option value={0}>
                                        <Text type="danger">Inactive</Text>
                                    </Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        <Space>
                            <PercentageOutlined />
                            <span>Chi tiết khuyến mãi</span>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="discount"
                                label="Giảm giá (%)"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập phần trăm giảm giá!' },
                                    { type: 'number', min: 1, max: 100, message: 'Giảm giá phải từ 1% đến 100%!' },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    max={100}
                                    style={{ width: '100%' }}
                                    placeholder="Nhập phần trăm giảm giá"
                                    prefix={<PercentageOutlined />}
                                    formatter={(value) => `${value}%`}
                                    parser={(value: any) => value!.replace('%', '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="quantity"
                                label="Số lượng"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số lượng!' },
                                    { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    style={{ width: '100%' }}
                                    placeholder="Nhập số lượng"
                                    prefix={<NumberOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">
                        <Space>
                            <CalendarOutlined />
                            <span>Thời gian áp dụng</span>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="startDate"
                                label="Ngày bắt đầu"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày bắt đầu"
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    suffixIcon={<CalendarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="endDate"
                                label="Ngày kết thúc"
                                rules={[
                                    { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                                    { validator: validateEndDate },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày kết thúc"
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                    suffixIcon={<CalendarOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="createdBy"
                        label="Người tạo"
                        hidden
                        rules={[{ required: true, message: 'Vui lòng nhập người tạo!' }]}
                    >
                        <Input placeholder="Nhập tên người tạo" prefix={<UserOutlined />} />
                    </Form.Item>

                    <Divider />

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <Button onClick={handleCancel} size="large">
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                icon={<PlusOutlined />}
                                size="large"
                            >
                                Tạo khuyến mãi
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
        </Modal>
    );
};

export default CreatePromotion;
