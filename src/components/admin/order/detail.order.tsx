import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Typography, Table, Button, Steps, Card, Row, Col, Avatar, Statistic } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DollarOutlined, ShoppingOutlined, UserOutlined, CalendarOutlined, FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import "./detail.order.scss"

const { Title, Text } = Typography;
const { Step } = Steps;

interface IDetailOrderProps {
    openViewDetail: boolean;
    setOpenViewDetail: (value: boolean) => void;
    dataViewDetail: IOrder | null;
}

// Mapping trạng thái đơn hàng
const orderStatusMap = {
    0: { text: 'Đã hủy', color: 'error', icon: <CloseCircleOutlined /> },
    1: { text: 'Chờ xác nhận', color: 'warning', icon: <ClockCircleOutlined /> },
    2: { text: 'Đang xử lý', color: 'processing', icon: <ClockCircleOutlined /> },
    3: { text: 'Đang giao hàng', color: 'processing', icon: <ClockCircleOutlined /> },
    4: { text: 'Đã giao hàng', color: 'success', icon: <CheckCircleOutlined /> },
};

const DetailOrder: React.FC<IDetailOrderProps> = ({
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
}) => {
    const [loading, setLoading] = useState<boolean>(false);

    if (!dataViewDetail) return null;

    // Tính tổng tiền của đơn hàng
    const calculateOrderTotal = (orderDetails: IOrderDetail[]): number => {
        return orderDetails.reduce((total, item) => total + item.totalPrice, 0);
    };

    // Tính toán các bước trong quy trình đơn hàng
    const getCurrentStep = (status: number) => {
        switch (status) {
            case 0: return -1; // Đã hủy
            case 1: return 0;  // Chờ xác nhận
            case 2: return 1;  // Đang xử lý
            case 3: return 2;  // Đang giao hàng
            case 4: return 3;  // Đã giao hàng
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
            width={1100} // Giảm width xuống một chút
            centered
            footer={[
                <Button key="close" onClick={() => setOpenViewDetail(false)}>
                    Đóng
                </Button>,
                <Button
                    key="export"
                    type="primary"
                    icon={<FilePdfOutlined />}
                    loading={loading}
                    onClick={handleExportPDF}
                >
                    Xuất hóa đơn
                </Button>,
            ]}
            bodyStyle={{
                padding: '16px', // Giảm padding
                maxHeight: '75vh', // Giảm chiều cao tối đa
                overflowY: 'auto',
                backgroundColor: '#f5f7fa'
            }}
            style={{ top: 20 }}
        >
            <Row gutter={[16, 16]}> {/* Giảm gutter */}
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
                            <Step title={<span style={{ fontSize: 14 }}>Xác nhận</span>} description={<span style={{ fontSize: 12 }}>Đang xử lý</span>} />
                            <Step title={<span style={{ fontSize: 14 }}>Vận chuyển</span>} description={<span style={{ fontSize: 12 }}>Đang giao hàng</span>} />
                            <Step title={<span style={{ fontSize: 14 }}>Hoàn thành</span>} description={<span style={{ fontSize: 12 }}>Đã giao hàng</span>} />
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
                                            <Table.Summary.Row>
                                                <Table.Summary.Cell index={0} colSpan={3}>
                                                    <Text strong style={{ fontSize: 14, paddingLeft: 16 }}>Tổng cộng</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={1} align="right">
                                                    <Text strong style={{ color: '#f5222d', fontSize: 16, paddingRight: 16 }}>
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                                                    </Text>
                                                </Table.Summary.Cell>
                                            </Table.Summary.Row>
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