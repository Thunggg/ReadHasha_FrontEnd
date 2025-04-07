import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { updateCategoryAPI } from '@/services/api';
// import { updateCategoryAPI } from '@/services/api'; 

interface EditCategoryProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (open: boolean) => void;
    dataUpdate: ICategory | null;
    reloadTable: () => void;
}

const EditCategory: React.FC<EditCategoryProps> = ({
    openModalUpdate,
    setOpenModalUpdate,
    dataUpdate,
    reloadTable,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Khi modal mở và dataUpdate có giá trị, reset form và set các giá trị mới
    useEffect(() => {
        if (openModalUpdate && dataUpdate) {
            form.resetFields();
            form.setFieldsValue({
                catName: dataUpdate.catName,
                catDescription: dataUpdate.catDescription,
                catStatus: dataUpdate.catStatus,
            });
        }
    }, [openModalUpdate, dataUpdate, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const updateData = { ...values, catID: dataUpdate?.catID };
            const res = await updateCategoryAPI(updateData);
            if (res.data && res.statusCode === 200) {
                message.success('Cập nhật danh mục thành công!');
                form.resetFields();
                setOpenModalUpdate(false);
                reloadTable();
            } else {
                message.error('Có lỗi xảy ra: ' + res.message);
            }
        } catch (error) {
            console.log('Validate failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setOpenModalUpdate(false);
        form.resetFields();
    };

    return (
        <Modal
            title="Chỉnh sửa danh mục"
            open={openModalUpdate}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={loading}
            okText="Cập nhật"
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
                {/* <Form.Item
                    label="Trạng thái"
                    name="catStatus"
                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                    <Select>
                        <Select.Option value={1}>Active</Select.Option>
                        <Select.Option value={0}>Inactive</Select.Option>
                    </Select>
                </Form.Item> */}
            </Form>
        </Modal>
    );
};

export default EditCategory;
