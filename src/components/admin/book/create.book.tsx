// import { createBookAPI } from '@/services/api';
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Select, Upload } from 'antd';
import { FormProps } from 'antd/lib';
import { useState } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import { createBookAPI } from '@/services/api';

type BookFormType = {
    bookTitle: string;
    author: string;
    translator?: string;
    publisher: string;
    publicationYear: number;
    isbn: string;
    bookDescription: string;
    hardcover: number;
    dimension: string;
    weight: number;
    bookPrice: number;
    bookQuantity: number;
    bookStatus: number;
    bookCategories: number[];
};

interface IProps {
    openModalCreate: boolean;
    setOpenModalCreate: (v: boolean) => void;
    refreshTable: () => void;
    categoryData: ICategory[];
    setCategoryData: (v: ICategory[]) => void;
}

const CreateBook = (props: IProps) => {
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const { openModalCreate, setOpenModalCreate, refreshTable, categoryData } = props;

    const onFinish: FormProps<BookFormType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        try {
            const formData = new FormData();

            // 1. Tạo object book từ values và convert sang JSON
            const bookData = {
                bookTitle: values.bookTitle,
                author: values.author,
                publisher: values.publisher,
                publicationYear: values.publicationYear,
                isbn: values.isbn,
                bookDescription: values.bookDescription,
                hardcover: values.hardcover,
                dimension: values.dimension,
                weight: values.weight,
                bookPrice: values.bookPrice,
                bookQuantity: values.bookQuantity,
                bookCategories: values.bookCategories?.map(catId => ({
                    catId: {
                        catID: catId
                    }
                })) || []
            };

            // 2. Thêm phần "book" là 1 chuỗi JSON
            formData.append('book', JSON.stringify(bookData));

            // 3. Thêm phần "image" (nếu có)
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append('image', fileList[0].originFileObj);
            }

            const res = await createBookAPI(formData);
            console.log(res);
            if (res.data && res.statusCode === 200) {
                message.success('Tạo mới sách thành công');
                form.resetFields();
                setFileList([]);
                setOpenModalCreate(false);
                refreshTable();
            } else {
                message.error(res.message || 'Lỗi không xác định');
            }
        } catch (error: any) {
            message.error("Lỗi hệ thống: " + (error.response?.data?.message || error.message));
        }
        setIsSubmit(false);
    };

    return (
        <Modal
            open={openModalCreate}
            // onOk={() => form.submit()}
            onOk={() => {
                form.submit();
                refreshTable();
            }}
            onCancel={() => {
                form.resetFields();
                setOpenModalCreate(false);
            }}
            destroyOnClose={true}
            okButtonProps={{ loading: isSubmit }}
            okText={"Tạo mới"}
            cancelText={"Hủy"}
            confirmLoading={isSubmit}
            width={800}
            maskClosable={false}
            style={{ top: 20 }}
        >
            <div style={{ padding: '16px 24px' }}>
                <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#1890ff',
                    marginBottom: '24px',
                    textAlign: 'center',
                    borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '12px'
                }}>
                    Thêm Sách Mới
                </h2>

                <Form
                    form={form}
                    name="createBook"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ bookStatus: 1 }}
                    onFinish={onFinish}
                    autoComplete="off"
                    labelAlign="left"
                    labelWrap
                >
                    <Row gutter={24}>
                        {/* Cột trái - Thông tin cơ bản */}
                        <Col span={12}>
                            <div style={{
                                padding: '16px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                marginBottom: '24px'
                            }}>
                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Tên sách</span>}
                                    name="bookTitle"
                                    rules={[{ required: true, message: 'Vui lòng nhập tên sách' }]}
                                >
                                    <Input style={{ borderRadius: '6px' }} />
                                </Form.Item>

                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Tác giả</span>}
                                    name="author"
                                    rules={[{ required: true, message: 'Vui lòng nhập tác giả' }]}
                                >
                                    <Input style={{ borderRadius: '6px' }} />
                                </Form.Item>

                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Dịch giả</span>}
                                    name="translator"
                                >
                                    <Input style={{ borderRadius: '6px' }} />
                                </Form.Item>
                            </div>

                            <div style={{
                                padding: '16px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Nhà xuất bản</span>}
                                    name="publisher"
                                    rules={[{ required: true, message: 'Vui lòng nhập NXB' }]}
                                >
                                    <Input style={{ borderRadius: '6px' }} />
                                </Form.Item>

                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Năm XB</span>}
                                    name="publicationYear"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập năm XB' },
                                        { type: 'number', min: 1900, max: new Date().getFullYear() }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%', borderRadius: '6px' }}
                                        placeholder="2023"
                                    />
                                </Form.Item>

                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>ISBN</span>}
                                    name="isbn"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập ISBN' },
                                        { pattern: /^(?:\d{13}|\d{10})$/, message: 'ISBN phải là 10 hoặc 13 số' }
                                    ]}
                                >
                                    <Input style={{ borderRadius: '6px' }} />
                                </Form.Item>
                            </div>
                        </Col>

                        {/* Cột phải - Thông tin bán hàng */}
                        <Col span={12}>
                            <div style={{
                                padding: '16px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                marginBottom: '24px'
                            }}>
                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Giá bán</span>}
                                    name="bookPrice"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập giá' },
                                        { type: 'number', min: 1000 }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%', borderRadius: '6px' }}
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        addonAfter={<span style={{ color: '#666' }}>₫</span>}
                                    />
                                </Form.Item>

                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Số lượng</span>}
                                    name="bookQuantity"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số lượng' },
                                        { type: 'number', min: 0 }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%', borderRadius: '6px' }}
                                        placeholder="0"
                                    />
                                </Form.Item>

                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Trạng thái</span>}
                                    name="bookStatus"
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        style={{ borderRadius: '6px' }}
                                        options={[
                                            { value: 1, label: 'Còn hàng' },
                                            { value: 0, label: 'Hết hàng' },
                                        ]}
                                    />
                                </Form.Item>
                            </div>

                            <div style={{
                                padding: '16px',
                                background: '#f8f9fa',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Danh mục</span>}
                                    name="bookCategories"
                                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 danh mục' }]}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Chọn danh mục"
                                        style={{ borderRadius: '6px' }}
                                        options={categoryData.map(c => ({
                                            value: c.catID,
                                            label: c.catName
                                        }))}
                                    />
                                </Form.Item>

                                <Form.Item label={<span style={{ fontWeight: 500 }}>Ảnh bìa</span>}>
                                    <Upload
                                        listType="picture-card"
                                        beforeUpload={() => false}
                                        onChange={({ fileList }) => setFileList(fileList)}
                                        accept="image/*"
                                        maxCount={1}
                                        fileList={fileList}
                                        style={{ display: 'block' }}
                                    >
                                        {fileList.length < 1 && (
                                            <div style={{
                                                color: '#1890ff',
                                                fontSize: '14px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center'
                                            }}>
                                                <span style={{ fontSize: '24px' }}>+</span>
                                                <span>Tải lên ảnh</span>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>

                    {/* Thông tin bổ sung */}
                    <div style={{
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        marginTop: '16px'
                    }}>
                        <Form.Item<BookFormType>
                            label={<span style={{ fontWeight: 500 }}>Mô tả sách</span>}
                            name="bookDescription"
                            labelCol={{ span: 4 }}
                            wrapperCol={{ span: 20 }}
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                        >
                            <Input.TextArea
                                rows={4}
                                style={{ borderRadius: '6px' }}
                                placeholder="Nhập mô tả chi tiết về sách..."
                            />
                        </Form.Item>

                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Kích thước</span>}
                                    name="dimension"
                                >
                                    <Input
                                        placeholder="20 x 13 cm"
                                        suffix={<span style={{ color: '#666' }}>cm</span>}
                                        style={{ borderRadius: '6px' }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Số trang</span>}
                                    name="hardcover"
                                    rules={[{ type: 'number', min: 1 }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%', borderRadius: '6px' }}
                                        placeholder="368"
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item<BookFormType>
                                    label={<span style={{ fontWeight: 500 }}>Trọng lượng</span>}
                                    name="weight"
                                    rules={[{ type: 'number', min: 1 }]}
                                >
                                    <InputNumber
                                        style={{ width: '100%', borderRadius: '6px' }}
                                        addonAfter={<span style={{ color: '#666' }}>gram</span>}
                                        placeholder="400"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};

export default CreateBook;