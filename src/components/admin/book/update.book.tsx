import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Select, Upload } from 'antd';
import { FormProps } from 'antd/lib';
import { useState, useEffect } from 'react';
import type { UploadFile } from 'antd/es/upload/interface';
import { updateBookAPI } from '@/services/api';
// import { updateBookAPI } from '@/services/api';

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
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    dataUpdate: IBook | null;
    setDataUpdate: (v: IBook | null) => void;
    categoryData: ICategory[];
}

const EditBook = (props: IProps) => {
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const {
        openModalUpdate,
        setOpenModalUpdate,
        refreshTable,
        dataUpdate,
        setDataUpdate,
        categoryData
    } = props;

    useEffect(() => {
        if (dataUpdate) {
            form.setFieldsValue({
                ...dataUpdate,
                bookCategories: dataUpdate.bookCategories?.map(c => c.catId.catID),
                publicationYear: dataUpdate.publicationYear,
            });

            const imageURL = `${import.meta.env.VITE_BACKEND_URL}${dataUpdate?.image}`;

            if (dataUpdate.image) {
                setFileList([{
                    uid: '-1',
                    name: 'current-image',
                    status: 'done',
                    url: imageURL,
                }]);
            }
        }

    }, [dataUpdate, form]);

    const onFinish: FormProps<BookFormType>['onFinish'] = async (values) => {
        setIsSubmit(true);
        try {
            const formData = new FormData();

            // 1. Xử lý chuyển đổi danh mục
            const bookCategories: IBookCategory[] = values.bookCategories?.map(catId => {
                // Tìm category trong danh sách
                const category = categoryData.find(c => c.catID === catId);
                if (!category) {
                    throw new Error(`Không tìm thấy danh mục với ID: ${catId}`);
                }

                return {
                    bookCateId: 0, // Backend sẽ tự generate
                    catId: {
                        catID: category.catID,
                        catName: category.catName,
                        catDescription: category.catDescription,
                        catStatus: category.catStatus
                    }
                } as IBookCategory;
            }) || [];

            // 2. Tạo object book đúng chuẩn interface
            const bookData: IBook = {
                ...dataUpdate, // Giữ các giá trị cũ không thay đổi
                ...values,
                bookID: dataUpdate?.bookID || 0,
                publicationYear: Number(values.publicationYear),
                hardcover: Number(values.hardcover),
                weight: Number(values.weight),
                bookPrice: Number(values.bookPrice),
                bookQuantity: Number(values.bookQuantity),
                bookStatus: dataUpdate?.bookStatus || 1, // Luôn giữ nguyên status hiện tại
                bookCategories: bookCategories
            };

            // 3. Thêm dữ liệu vào FormData
            formData.append('book', JSON.stringify(bookData));

            // 4. Xử lý ảnh
            if (fileList.length > 0) {
                // Trường hợp có ảnh mới
                if (fileList[0].originFileObj) {
                    formData.append('image', fileList[0].originFileObj);
                }
                // Trường hợp giữ ảnh cũ (gửi lại URL ảnh)
                else if (fileList[0].url) {
                    formData.append('image', fileList[0].url);
                }
            }

            // 5. Gọi API update
            const res = await updateBookAPI(formData);

            if (res.data && res.statusCode === 200) {
                message.success('Cập nhật sách thành công');
                form.resetFields();
                setFileList([]);
                setOpenModalUpdate(false);
                refreshTable();
            } else {
                message.error(res.message || 'Cập nhật thất bại');
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || error.message || "Lỗi hệ thống");
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <Modal
            open={openModalUpdate}
            onOk={() => form.submit()}
            onCancel={() => {
                form.resetFields();
                setDataUpdate(null);
                setFileList([]);
                setOpenModalUpdate(false);
            }}
            destroyOnClose={true}
            okButtonProps={{ loading: isSubmit }}
            okText={"Cập nhật"}
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
                    Chỉnh Sửa Thông Tin Sách
                </h2>

                <Form
                    form={form}
                    name="editBook"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ bookStatus: 1 }}
                    onFinish={onFinish}
                    autoComplete="off"
                    labelAlign="left"
                    labelWrap
                >
                    <Row gutter={24}>
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
                                        { type: 'number', min: 1900, max: new Date().getFullYear(), message: "Năm xuất bản phải nằm trong khoảng 1900-2025" }
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
                                        { type: 'number', min: 1000, message: 'Giá sách phải lớn hơn hoặc bằng 1000' }
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
                                        { type: 'number', min: 0, message: 'Số lượng sách phải lớn hơn hoặc bằng 0' }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%', borderRadius: '6px' }}
                                        placeholder="0"
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
                                        onChange={({ fileList }) => {
                                            // Thêm URL preview cho file mới
                                            const newFileList = fileList.map(file => {
                                                if (file.originFileObj) {
                                                    file.url = URL.createObjectURL(file.originFileObj);
                                                }
                                                return file;
                                            });
                                            setFileList(newFileList);
                                        }}
                                        accept="image/*"
                                        maxCount={1}
                                        fileList={fileList}
                                        onPreview={(file) => {
                                            // Xử lý xem ảnh phóng to
                                            Modal.info({
                                                title: 'Xem trước ảnh',
                                                content: (
                                                    <img
                                                        alt="preview"
                                                        src={file.url || file.thumbUrl}
                                                        style={{ width: '100%' }}
                                                    />
                                                ),
                                            });
                                        }}
                                    >
                                        {fileList.length < 1 && (
                                            <div style={{ /* ... */ }}>
                                                <span>+</span>
                                                <span>Tải lên ảnh</span>
                                            </div>
                                        )}
                                    </Upload>
                                </Form.Item>
                            </div>
                        </Col>
                    </Row>

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

export default EditBook;