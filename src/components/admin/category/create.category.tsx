import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { createCategoryAPI } from '@/services/api';

interface CreateCategoryProps {
    openModalCreate: boolean;
    setOpenModalCreate: (open: boolean) => void;
    reloadTable: () => void;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({
    openModalCreate,
    setOpenModalCreate,
    reloadTable,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            // Gọi API tạo danh mục mới với dữ liệu từ form
            const res = await createCategoryAPI(values);
            if (res.data && res.statusCode === 200) {
                message.success('Tạo danh mục thành công!');
                form.resetFields();
                setOpenModalCreate(false);
                reloadTable();
            } else {
                message.error('Có lỗi xảy ra: ' + res.message);
            }
        } catch (error) {
            console.log('Validate Failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setOpenModalCreate(false);
        form.resetFields();
    };

    return (
        <Modal
            title="Thêm danh mục mới"
            open={openModalCreate}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Tạo mới"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Tên danh mục"
                    name="catName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>
                <Form.Item
                    label="Mô tả"
                    name="catDescription"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <Input.TextArea placeholder="Nhập mô tả danh mục" />
                </Form.Item>
                <Form.Item
                    label="Trạng thái"
                    name="catStatus"
                    initialValue={1}
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                    <Select>
                        <Select.Option value={1}>Active</Select.Option>
                        <Select.Option value={0}>Inactive</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateCategory;
