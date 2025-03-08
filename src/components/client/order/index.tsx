// OrderDetail.tsx
import { App, Button, Col, Divider, Empty, InputNumber, Row } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useCurrentApp } from '@/components/context/app.context';
import '@/styles/order.scss';

const OrderDetail = () => {
    const { carts, setCarts } = useCurrentApp();
    const [totalPrice, setTotalPrice] = useState(0);
    const { message } = App.useApp();

    useEffect(() => {
        const sum = carts.reduce((acc, item) => acc + (item.quantity * (item.detail?.bookPrice || 0)), 0);
        setTotalPrice(sum);
    }, [carts]);

    const handleOnChangeInput = (value: number | null, book: IBook) => {
        if (!value || value < 1) return;
        const updatedCarts = carts.map(cart =>
            cart.id === book.bookID ? { ...cart, quantity: value } : cart
        );
        localStorage.setItem("carts", JSON.stringify(updatedCarts));
        setCarts(updatedCarts);
    };

    const handleRemoveBook = (id: number) => {
        const updatedCarts = carts.filter(item => item.id !== id);
        localStorage.setItem("carts", JSON.stringify(updatedCarts));
        setCarts(updatedCarts);
    };

    return (
        <div className="order-page-container">
            <div className="order-container">
                <Row gutter={[24, 24]}>
                    <Col md={16} xs={24}>
                        <div className="order-list">
                            {carts.map((item, index) => (
                                <div className="order-book" key={`book-${index}`}>
                                    <div className="book-content">
                                        <img
                                            src={`${import.meta.env.VITE_BACKEND_URL}${item.detail.image}`}
                                        // alt={item.detail.bookTitle}
                                        />
                                        <div className="book-info">
                                            <div className="book-title">{item.detail.bookTitle}</div>
                                            <div className="book-price">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(item.detail.bookPrice)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="action">
                                        <InputNumber
                                            min={1}
                                            max={99}
                                            value={item.quantity}
                                            onChange={(value) => handleOnChangeInput(value, item.detail)}
                                            className="quantity-input"
                                        />
                                        <DeleteOutlined
                                            onClick={() => handleRemoveBook(item.id)}
                                            className="delete-icon"
                                        />
                                    </div>
                                    <div className="sum">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(item.detail.bookPrice * item.quantity)}
                                    </div>
                                </div>
                            ))}
                            {carts.length === 0 && (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span className="empty-cart-text">
                                            Giỏ hàng của bạn đang trống
                                        </span>
                                    }
                                />
                            )}
                        </div>
                    </Col>

                    <Col md={8} xs={24}>
                        <div className="order-sum">
                            <div className="summary-section">
                                <div className="calculate">
                                    <span>Tạm tính:</span>
                                    <span>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(totalPrice)}
                                    </span>
                                </div>
                                <Divider className="custom-divider" />
                                <div className="calculate">
                                    <span>Tổng tiền:</span>
                                    <span className="sum-final">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(totalPrice)}
                                    </span>
                                </div>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    className="checkout-btn"
                                // onClick={handleNextStep}
                                >
                                    Thanh toán ({carts.length})
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default OrderDetail;