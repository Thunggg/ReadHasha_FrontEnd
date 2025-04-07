import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Typography, Table, Button, Steps, Card, Row, Col, Avatar, Statistic, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DollarOutlined, ShoppingOutlined, UserOutlined, CalendarOutlined, FilePdfOutlined, TagOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import "./detail.order.scss"
import { approveOrderAPI } from '@/services/api';
import { useCurrentApp } from '@/components/context/app.context';

const { Title, Text } = Typography;
const { Step } = Steps;

interface IDetailOrderProps {
    openViewDetail: boolean;
    setOpenViewDetail: (value: boolean) => void;
    dataViewDetail: IOrder | null;
    reloadTable?: () => void;
}

// Mapping trạng thái đơn hàng
const orderStatusMap = {
    0: { text: 'Đã hủy', color: 'error', icon: <CloseCircleOutlined /> },
    1: { text: 'Chờ xác nhận', color: 'warning', icon: <ClockCircleOutlined /> },
    2: { text: 'Đã xác nhận', color: 'success', icon: <CheckCircleOutlined /> },
};

const DetailOrder: React.FC<IDetailOrderProps> = ({
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
    reloadTable
}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
    const { user } = useCurrentApp();

    if (!dataViewDetail) return null;

    // Tính tổng tiền của đơn hàng
    const calculateOrderTotal = (orderDetails: IOrderDetail[]): number => {
        return orderDetails.reduce((total, item) => total + item.totalPrice, 0);
    };

    // Tính tổng tiền gốc trước khi áp dụng giảm giá
    const calculateOriginalTotal = (orderDetails: IOrderDetail[]): number => {
        return orderDetails.reduce((total, item) => total + (item.bookID.bookPrice * item.quantity), 0);
    };

    // Tính phần trăm giảm giá dựa vào giá gốc và giá cuối cùng
    const calculateDiscountPercentage = (): number => {
        const originalTotal = calculateOriginalTotal(dataViewDetail.orderDetailList);
        const finalTotal = calculateOrderTotal(dataViewDetail.orderDetailList);

        if (originalTotal === 0 || originalTotal === finalTotal) return 0;

        const discountPercent = ((originalTotal - finalTotal) / originalTotal) * 100;
        return Math.round(discountPercent * 10) / 10; // Round to 1 decimal place
    };

    // Tính toán các bước trong quy trình đơn hàng
    const getCurrentStep = (status: number) => {
        switch (status) {
            case 0: return -1; // Đã hủy
            case 1: return 0;  // Chờ xác nhận
            case 2: return 1;  // Đã xác nhận
            default: return 0;
        }
    };

    const currentStep = getCurrentStep(dataViewDetail.orderStatus);

    // Xử lý xuất hóa đơn PDF
    const handleExportPDF = () => {
        setLoading(true);
        setTimeout(() => {
            console.log('Exporting PDF for order:', dataViewDetail.orderID);
            setLoading(false);
        }, 1000);
    };

    // Xử lý cập nhật trạng thái đơn hàng
    const handleConfirmOrder = async () => {
        if (!dataViewDetail || !user || !user.username) {
            message.error('Bạn cần đăng nhập để thực hiện thao tác này');
            return;
        }

        setConfirmLoading(true);
        try {
            // Gọi API để admin xác nhận đơn hàng
            const res = await approveOrderAPI(dataViewDetail.orderID, user.username);

            if (res.statusCode === 200) {
                message.success('Đã xác nhận đơn hàng thành công!');
                // Đóng modal chi tiết đơn hàng
                setOpenViewDetail(false);
                // Reload lại bảng đơn hàng
                if (reloadTable) reloadTable();
            } else {
                message.error('Có lỗi xảy ra khi xác nhận đơn hàng: ' + res.message);
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            message.error('Không thể kết nối đến server hoặc có lỗi xảy ra');
        } finally {
            setConfirmLoading(false);
        }
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'bookID',
            key: 'bookID',
            render: (bookID: any, record: IOrderDetail) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        shape="square"
                        size={64}
                        src={"http://localhost:8080" + bookID.image}
                        style={{ marginRight: 12 }}
                    />
                    <div>
                        <div><Text strong>{bookID.bookTitle}</Text></div>
                        <div><Text type="secondary">Tác giả: {bookID.author}</Text></div>
                        <div><Text type="secondary">NXB: {bookID.publisher}</Text></div>
                        <div>
                            <Text type="secondary">
                                Thể loại: {bookID.bookCategories.map((cat: any) => cat.catId.catName).join(', ')}
                            </Text>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'bookID',
            key: 'price',
            align: 'right' as 'right',
            render: (bookID: any) => (
                <Text>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookID.bookPrice)}</Text>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center' as 'center',
        },
        {
            title: 'Giảm giá',
            key: 'discount',
            align: 'center' as 'center',
            render: (_: any, record: IOrderDetail) => {
                // Calculate discount for this item
                const originalPrice = record.bookID.bookPrice * record.quantity;
                const finalPrice = record.totalPrice;

                if (originalPrice > finalPrice) {
                    const discountPercent = ((originalPrice - finalPrice) / originalPrice) * 100;
                    const roundedDiscount = Math.round(discountPercent * 10) / 10;

                    return (
                        <Tag color="green" style={{ fontSize: 12 }}>
                            {roundedDiscount}%
                        </Tag>
                    );
                }

                return <Text type="secondary">-</Text>;
            }
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            align: 'right' as 'right',
            render: (totalPrice: number) => (
                <Text strong style={{ color: '#f5222d' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                </Text>
            ),
        },
    ];

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ShoppingOutlined style={{ fontSize: 24, marginRight: 10, color: '#1890ff' }} />
                    <div>
                        <Title level={4} style={{ margin: 0 }}>Chi tiết đơn hàng</Title>
                        <Text type="secondary" style={{ fontSize: 15 }}>Mã đơn hàng: #{dataViewDetail.orderID}</Text>
                    </div>
                </div>
            }
            open={openViewDetail}
            onCancel={() => setOpenViewDetail(false)}
            width={1200} // Tăng width để rộng hơn
            centered
            footer={[
                <Button key="close" onClick={() => setOpenViewDetail(false)}>
                    Đóng
                </Button>,
                dataViewDetail.orderStatus === 1 && (
                    <Button
                        key="confirm"
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        loading={confirmLoading}
                        onClick={handleConfirmOrder}
                    >
                        Xác nhận đơn hàng
                    </Button>
                )
            ]}
            bodyStyle={{
                padding: '16px',
                maxHeight: '80vh', // Tăng chiều cao tối đa
                overflowY: 'auto',
                backgroundColor: '#f5f7fa'
            }}
            style={{ top: 20 }}
        >
            <Row gutter={[20, 20]}> {/* Tăng gutter */}
                <Col span={24}>
                    <Card
                        bordered={false}
                        className="order-status-card"
                        style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            borderRadius: '8px',
                            padding: '8px' // Giảm padding
                        }}
                        bodyStyle={{ padding: '12px' }} // Giảm padding của card body
                    >
                        <Steps
                            current={currentStep}
                            status={dataViewDetail.orderStatus === 0 ? 'error' : 'process'}
                            progressDot
                            size="small"
                        >
                            <Step title={<span style={{ fontSize: 14 }}>Đặt hàng</span>} description={<span style={{ fontSize: 12 }}>Chờ xác nhận</span>} />
                            <Step title={<span style={{ fontSize: 14 }}>Xác nhận</span>} description={<span style={{ fontSize: 12 }}>Đã xác nhận</span>} />
                        </Steps>
                        {dataViewDetail.orderStatus === 0 && (
                            <div style={{ marginTop: 12, textAlign: 'center' }}>
                                <Tag icon={<CloseCircleOutlined />} color="error" style={{ padding: '4px 8px', fontSize: 14 }}>
                                    Đơn hàng đã bị hủy
                                </Tag>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={17}>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <ShoppingOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: 16 }} />
                                <span style={{ fontSize: 16 }}>Thông tin sản phẩm</span>
                            </div>
                        }
                        bordered={false}
                        className="order-products-card"
                        style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            borderRadius: '8px'
                        }}
                        headStyle={{
                            backgroundColor: '#e6f7ff',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            padding: '10px 16px' // Giảm padding
                        }}
                        bodyStyle={{ padding: '0' }}
                    >
                        {dataViewDetail.orderDetailList.length > 0 ? (
                            <Table
                                dataSource={dataViewDetail.orderDetailList}
                                columns={columns}
                                pagination={false}
                                rowKey="odid"
                                size="small" // Sử dụng kích thước nhỏ cho bảng
                                summary={() => {
                                    const total = calculateOrderTotal(dataViewDetail.orderDetailList);

                                    return (
                                        <>
                                            {/* <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={3}>
                                                    <Text strong style={{ fontSize: 14, paddingLeft: 16 }}>Tổng cộng</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={1} align="right">
                                                    <Text strong style={{ color: '#f5222d', fontSize: 16, paddingRight: 16 }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                                                    </Text>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row> */}
                                        </>
                                    );
                                }}
                                style={{ borderRadius: '0 0 8px 8px', overflow: 'hidden' }}
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <Text type="secondary" style={{ fontSize: 14 }}>Không có sản phẩm nào trong đơn hàng</Text>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={7}>
                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <UserOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: 16 }} />
                                <span style={{ fontSize: 16 }}>Thông tin khách hàng</span>
                            </div>
                        }
                        bordered={false}
                        className="order-customer-card"
                        style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            borderRadius: '8px'
                        }}
                        headStyle={{
                            backgroundColor: '#e6f7ff',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            padding: '10px 16px' // Giảm padding
                        }}
                        bodyStyle={{ padding: '12px' }} // Giảm padding
                    >
                        <Descriptions column={1} size="small" labelStyle={{ fontWeight: 'bold', fontSize: 14 }} contentStyle={{ fontSize: 14 }}>
                            <Descriptions.Item label="Họ tên" style={{ padding: '8px 0' }}>
                                {dataViewDetail.customerName}
                            </Descriptions.Item>
                            <Descriptions.Item label={<>Địa chỉ</>} style={{ padding: '8px 0' }}>
                                {dataViewDetail.orderAddress}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <DollarOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: 16 }} />
                                <span style={{ fontSize: 16 }}>Thông tin thanh toán</span>
                            </div>
                        }
                        bordered={false}
                        className="order-payment-card"
                        style={{
                            marginTop: 16, // Giảm margin
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            borderRadius: '8px'
                        }}
                        headStyle={{
                            backgroundColor: '#e6f7ff',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            padding: '10px 16px' // Giảm padding
                        }}
                        bodyStyle={{ padding: '12px' }} // Giảm padding
                    >
                        {dataViewDetail.promotionCode && (
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                    <TagOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                                    <Text strong style={{ fontSize: 14 }}>Mã giảm giá:</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 24 }}>
                                    <Tag color="blue" style={{ padding: '2px 8px', fontSize: 13 }}>
                                        {dataViewDetail.promotionCode}
                                    </Tag>
                                    {calculateDiscountPercentage() > 0 && (
                                        <Text type="secondary" style={{ marginLeft: 8, fontSize: 13 }}>
                                            ({calculateDiscountPercentage()}% giảm giá)
                                        </Text>
                                    )}
                                </div>
                            </div>
                        )}

                        <Statistic
                            title={<span style={{ fontSize: 14, fontWeight: 'bold' }}>Tổng tiền đơn hàng</span>}
                            value={calculateOrderTotal(dataViewDetail.orderDetailList)}
                            precision={0}
                            valueStyle={{ color: '#f5222d', fontSize: 20, fontWeight: 'bold' }}
                            prefix={<DollarOutlined />}
                            formatter={(value) =>
                                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))
                            }
                            style={{ padding: '8px 0' }}
                        />

                        {calculateDiscountPercentage() > 0 && (
                            <div style={{ fontSize: 13, color: '#52c41a', marginTop: 4 }}>
                                <Text type="secondary">
                                    Đã giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                        calculateOriginalTotal(dataViewDetail.orderDetailList) - calculateOrderTotal(dataViewDetail.orderDetailList)
                                    )}
                                </Text>
                            </div>
                        )}
                    </Card>

                    <Card
                        title={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarOutlined style={{ color: '#1890ff', marginRight: 8, fontSize: 16 }} />
                                <span style={{ fontSize: 16 }}>Thông tin thời gian</span>
                            </div>
                        }
                        bordered={false}
                        className="order-time-card"
                        style={{
                            marginTop: 16, // Giảm margin
                            boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                            borderRadius: '8px'
                        }}
                        headStyle={{
                            backgroundColor: '#e6f7ff',
                            borderTopLeftRadius: '8px',
                            borderTopRightRadius: '8px',
                            padding: '10px 16px' // Giảm padding
                        }}
                        bodyStyle={{ padding: '12px' }} // Giảm padding
                    >
                        <Descriptions column={1} size="small" labelStyle={{ fontWeight: 'bold', fontSize: 14 }} contentStyle={{ fontSize: 14 }}>
                            <Descriptions.Item label="Ngày đặt hàng" style={{ padding: '8px 0' }}>
                                {dayjs(dataViewDetail.orderDate).format('DD/MM/YYYY')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái đơn hàng" style={{ padding: '8px 0' }}>
                                {orderStatusMap[dataViewDetail.orderStatus as keyof typeof orderStatusMap] ? (
                                    <Tag
                                        icon={orderStatusMap[dataViewDetail.orderStatus as keyof typeof orderStatusMap].icon}
                                        color={orderStatusMap[dataViewDetail.orderStatus as keyof typeof orderStatusMap].color}
                                        style={{ padding: '2px 8px', fontSize: 13 }}
                                    >
                                        {orderStatusMap[dataViewDetail.orderStatus as keyof typeof orderStatusMap].text}
                                    </Tag>
                                ) : (
                                    <Tag>Không xác định</Tag>
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
};

export default DetailOrder;