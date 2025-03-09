import { App, Button, Col, Divider, Form, message, notification, Radio, Row, Space, Typography } from 'antd';
import { DeleteOutlined, DeleteTwoTone, LeftOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Input } from 'antd';
import { useCurrentApp } from '@/components/context/app.context';
import type { FormProps } from 'antd';
import '@/styles/payment.scss';
import { CreateOrderAPI } from '@/services/api';
// import { createOrderAPI, getVNPayUrlAPI } from '@/services/api';
// import { isMobile } from 'react-device-detect';
// import { v4 as uuidv4 } from 'uuid';
const { Title } = Typography;
const { TextArea } = Input;

type UserMethod = "COD" | "BANKING";

type FieldType = {
    fullName: string;
    phone: string;
    address: string;
    method: UserMethod;
};

interface IProps {
    setCurrentStep: (v: number) => void;
}
const Payment = (props: IProps) => {
    const { carts, setCarts, user } = useCurrentApp();
    const [totalPrice, setTotalPrice] = useState(0);
    const [form] = Form.useForm();
    const [isSubmit, setIsSubmit] = useState(false);
    const { setCurrentStep } = props;

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.firstName + " " + user.lastName,
                phone: user.phone,
                method: "COD"
            })
        }
    }, [user])

    useEffect(() => {
        if (carts && carts.length > 0) {
            let sum = 0;
            carts.map(item => {
                sum += item.quantity * item.detail.bookPrice;
            })
            setTotalPrice(sum);
        } else {
            setTotalPrice(0);
        }
    }, [carts]);


    const handleRemoveBook = (_id: number) => {
        const cartStorage = localStorage.getItem("carts");
        if (cartStorage) {
            //update
            const carts = JSON.parse(cartStorage) as ICart[];
            const newCarts = carts.filter(item => item.id !== _id)
            localStorage.setItem("carts", JSON.stringify(newCarts));
            //sync React Context
            setCarts(newCarts);
        }
    }

    const handlePlaceOrder: FormProps<FieldType>['onFinish'] = async (values) => {
        const { address, phone, method } = values;

        // Kiểm tra xác thực user
        if (!user) {
            notification.error({
                message: "Lỗi xác thực",
                description: "Vui lòng đăng nhập để tiếp tục",
            });
            return;
        }

        // Kiểm tra giỏ hàng có sản phẩm hay không
        if (!carts?.length) {
            notification.warning({
                message: "Giỏ hàng trống",
                description: "Vui lòng thêm sản phẩm vào giỏ hàng",
            });
            return;
        }

        // Xây dựng payload đơn hàng, sử dụng id và quantity từ cart item (đã lưu trong localStorage)
        const orderPayload: IOrderRequest = {
            username: user.username,
            address,
            details: carts.map(item => ({
                bookId: item.id,       // Lấy id của sách (đã lưu trong localStorage)
                quantity: item.quantity // Lấy số lượng từ cart item
            }))
        };

        setIsSubmit(true);
        try {
            const res = await CreateOrderAPI(orderPayload);

            if (res && res.statusCode === 200) {
                message.success('Đặt hàng thành công!');
                localStorage.removeItem("carts");
                setCarts([]);
                setCurrentStep(2);
            } else {
                notification.error({
                    message: "Lỗi đặt hàng",
                    description: res.message || "Có lỗi xảy ra khi xử lý đơn hàng",
                    duration: 5
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi hệ thống",
                description: error.response?.data?.message || "Lỗi kết nối đến máy chủ",
                duration: 5
            });
        } finally {
            setIsSubmit(false);
        }
    };

    return (
        <div className="payment-container">
            <Button
                type="link"
                icon={<LeftOutlined />}
                onClick={() => setCurrentStep(0)}
                className="back-button"
            >
                Quay lại giỏ hàng
            </Button>

            <Row gutter={[24, 24]}>
                <Col md={16} xs={24}>
                    <div className="product-list">
                        <Title level={4} className="section-title">Sản phẩm đặt mua ({carts.length})</Title>
                        {carts.map((item, index) => (
                            <div className="order-item" key={`item-${index}`}>
                                <div className="item-content">
                                    <img
                                        src={`${import.meta.env.VITE_BACKEND_URL}${item.detail.image}`}
                                        className="product-image"
                                    />
                                    <div className="item-info">
                                        <div className="product-name">{item.detail.bookTitle}</div>
                                        <div className="product-quantity">Số lượng: {item.quantity}</div>
                                        <div className="product-price">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format(item.detail.bookPrice * item.quantity)}
                                        </div>
                                    </div>
                                </div>
                                <DeleteOutlined
                                    className="delete-icon"
                                    onClick={() => handleRemoveBook(item.id)}
                                />
                            </div>
                        ))}
                    </div>
                </Col>

                <Col md={8} xs={24}>
                    <Form
                        form={form}
                        name="payment-form"
                        onFinish={handlePlaceOrder}
                        autoComplete="off"
                        layout="vertical"
                        className="payment-form"
                    >
                        <div className="payment-summary">
                            <Title level={4} className="section-title">Thông tin thanh toán</Title>

                            <Form.Item<FieldType>
                                label="Hình thức thanh toán"
                                name="method"
                                className="form-item"
                            >
                                <Radio.Group className="payment-methods">
                                    <Space direction="vertical">
                                        <Radio value="COD" className="payment-method">
                                            <span className="method-title">Thanh toán khi nhận hàng (COD)</span>
                                            <span className="method-description">Nhận hàng và thanh toán tại nhà</span>
                                        </Radio>
                                        <Radio value="BANKING" className="payment-method">
                                            <span className="method-title">Ví điện tử VNPAY</span>
                                            <span className="method-description">Thanh toán qua cổng VNPAY</span>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Họ và tên"
                                name="fullName"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                className="form-item"
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Số điện thoại"
                                name="phone"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                className="form-item"
                            >
                                <Input size="large" />
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="Địa chỉ nhận hàng"
                                name="address"
                                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                                className="form-item"
                            >
                                <TextArea rows={3} size="large" />
                            </Form.Item>

                            <Divider className="summary-divider" />

                            <div className="price-summary">
                                <div className="price-row">
                                    <span>Tạm tính:</span>
                                    <span>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(totalPrice)}
                                    </span>
                                </div>
                                <div className="price-row total">
                                    <span>Tổng tiền:</span>
                                    <span className="total-price">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                loading={isSubmit}
                                block
                                className="submit-button"
                            >
                                Đặt hàng ngay
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </div>
    )

}

export default Payment;