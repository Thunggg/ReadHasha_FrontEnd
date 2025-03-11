import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button, message, notification, Space, Divider, Typography, Card, Row, Col, Tooltip } from 'antd';
import { updatePromotionAPI } from '@/services/api';
import dayjs from 'dayjs';
import { SaveOutlined, InfoCircleOutlined, CalendarOutlined, PercentageOutlined, NumberOutlined, TagOutlined, UserOutlined, EditOutlined } from '@ant-design/icons';
import { useCurrentApp } from '@/components/context/app.context';

const { Option } = Select;
const { Title, Text } = Typography;

interface IEditPromotionProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (value: boolean) => void;
    dataUpdate: any;
    reloadTable: () => void;
}

// Định nghĩa interface cho request update promotion theo backend
interface UpdatePromotionRequest {
    proID: number;
    proName: string;
    discount: number;
    startDate: string;
    endDate: string;
    quantity: number;
    proStatus: number;
    updatedBy: string;
}

const EditPromotion: React.FC<IEditPromotionProps> = ({
    openModalUpdate,
    setOpenModalUpdate,
    dataUpdate,
    reloadTable,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState<boolean>(false);
    const { user } = useCurrentApp();

    useEffect(() => {
        if (dataUpdate && openModalUpdate) {
            form.setFieldsValue({
                proID: dataUpdate.proID,
                proName: dataUpdate.proName,
                proCode: dataUpdate.proCode, // Chỉ hiển thị, không gửi lên server
                discount: dataUpdate.discount,
                quantity: dataUpdate.quantity,
                startDate: dataUpdate.startDate ? dayjs(dataUpdate.startDate) : null,
                endDate: dataUpdate.endDate ? dayjs(dataUpdate.endDate) : null,
                proStatus: dataUpdate.proStatus,
                updatedBy: user?.username
            });
        }
    }, [dataUpdate, openModalUpdate, form, user]);

    const handleCancel = () => {
        form.resetFields();
        setOpenModalUpdate(false);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Tạo request object theo yêu cầu của backend
            const updateRequest: UpdatePromotionRequest = {
                proID: values.proID,
                proName: values.proName,
                discount: values.discount,
                startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
                endDate: dayjs(values.endDate).format('YYYY-MM-DD'),
                quantity: values.quantity,
                proStatus: values.proStatus,
                updatedBy: values.updatedBy
            };

            const res = await updatePromotionAPI(updateRequest);
            if (res && res.statusCode === 200) {
                message.success('Cập nhật khuyến mãi thành công!');
                handleCancel();
                reloadTable();
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message || 'Không thể cập nhật khuyến mãi',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: 'Không thể cập nhật khuyến mãi',
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
                    <EditOutlined style={{ color: '#f57800' }} />
                    <Title level={4} style={{ margin: 0 }}>Chỉnh sửa khuyến mãi</Title>
                </div>
            }
            open={openModalUpdate}
            onCancel={handleCancel}
            footer={null}
            width={800}
            bodyStyle={{ padding: '24px', maxHeight: '80vh', overflowY: 'auto' }}
            centered
            destroyOnClose
        >
            <Card bordered={false} className="promotion-form-card">
                {dataUpdate && (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark="optional"
                    >
                        {/* Trường ẩn để lưu proID */}
                        <Form.Item name="proID" hidden>
                            <Input />
                        </Form.Item>

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
                                >
                                    <Input
                                        disabled
                                        style={{ textTransform: 'uppercase', backgroundColor: '#f5f5f5' }}
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
                                        suffixIcon={<CalendarOutlined />}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="updatedBy"
                            label="Người cập nhật"
                            hidden
                            rules={[{ required: true, message: 'Vui lòng nhập người cập nhật!' }]}
                        >
                            <Input placeholder="Nhập tên người cập nhật" prefix={<UserOutlined />} />
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
                                    icon={<SaveOutlined />}
                                    size="large"
                                    style={{ background: '#f57800', borderColor: '#f57800' }}
                                >
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </Modal>
    );
};

export default EditPromotion;