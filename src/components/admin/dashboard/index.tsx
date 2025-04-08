import React, { useEffect, useState } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Table,
    Tag,
    Divider,
    Space,
    Badge,
    Avatar,
    Empty,
    Spin
} from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    BookOutlined,
    DollarOutlined,
    RiseOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import { getBookAPI, getUserAPI, getOrderPaginationAPI } from '@/services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DashBoardPage: React.FC = () => {
    // State for statistics
    const [loadingStats, setLoadingStats] = useState<boolean>(true);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [totalBooks, setTotalBooks] = useState<number>(0);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    const [totalRevenue, setTotalRevenue] = useState<number>(0);

    // State for recent orders
    const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);

    // State for all orders status counts
    const [orderStatusCounts, setOrderStatusCounts] = useState<{ [key: number]: number }>({
        0: 0, // cancelled
        1: 0, // pending
        2: 0  // confirmed
    });

    // State for top books
    const [loadingBooks, setLoadingBooks] = useState<boolean>(true);
    const [topBooks, setTopBooks] = useState<any[]>([]);

    // Fetch statistics data
    const fetchStatistics = async () => {
        try {
            // Fetch total users
            const usersRes = await getUserAPI('pageSize=1');
            if (usersRes && usersRes.data && usersRes.data.meta) {
                setTotalUsers(usersRes.data.meta.total);
            }

            // Fetch total books
            const booksRes = await getBookAPI('pageSize=1');
            if (booksRes && booksRes.data && booksRes.data.meta) {
                setTotalBooks(booksRes.data.meta.total);
            }

            // Fetch total orders and calculate revenue
            const ordersRes = await getOrderPaginationAPI('pageSize=500'); // Get a large number to calculate stats
            if (ordersRes && ordersRes.data && ordersRes.data.meta) {
                const orders = ordersRes.data.result || [];
                setTotalOrders(ordersRes.data.meta.total);

                // Count orders by status
                const statusCounts = {
                    0: 0, // cancelled
                    1: 0, // pending
                    2: 0  // confirmed
                };

                orders.forEach((order: any) => {
                    const status = order.orderStatus as number;
                    if (status === 0 || status === 1 || status === 2) {
                        statusCounts[status]++;
                    }
                });

                setOrderStatusCounts(statusCounts);

                // Calculate total revenue from confirmed orders (status 2)
                const confirmedOrders = orders.filter((order: any) => order.orderStatus === 2);
                const total = confirmedOrders.reduce((acc: number, order: any) => {
                    const orderTotal = order.orderDetailList.reduce(
                        (sum: number, detail: any) => sum + detail.totalPrice,
                        0
                    );
                    return acc + orderTotal;
                }, 0);

                setTotalRevenue(total);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    // Fetch recent orders
    const fetchRecentOrders = async () => {
        try {
            const res = await getOrderPaginationAPI('current=1&pageSize=5&sort=-orderID'); // Get latest 5 orders
            if (res && res.data && res.data.result) {
                setRecentOrders(res.data.result);
            }
        } catch (error) {
            console.error('Error fetching recent orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    // Fetch top books
    const fetchTopBooks = async () => {
        try {
            // Get books sorted by sold count (most popular first)
            const res = await getBookAPI('current=1&pageSize=8&sort=-sold');
            if (res && res.data && res.data.result) {
                setTopBooks(res.data.result);
            }
        } catch (error) {
            console.error('Error fetching top books:', error);
        } finally {
            setLoadingBooks(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
        fetchRecentOrders();
        fetchTopBooks();
    }, []);

    // Columns for recent orders table
    const orderColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderID',
            key: 'orderID',
            render: (id: number) => <a>#{id}</a>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            key: 'customerName',
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'orderDate',
            key: 'orderDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Tổng tiền',
            key: 'total',
            render: (_: any, record: any) => {
                const total = record.orderDetailList.reduce(
                    (sum: number, detail: any) => sum + detail.totalPrice,
                    0
                );
                return (
                    <Text strong style={{ color: '#f5222d' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                    </Text>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            key: 'orderStatus',
            render: (status: number) => {
                let color = '';
                let text = '';

                switch (status) {
                    case 0:
                        color = 'error';
                        text = 'Đã hủy';
                        break;
                    case 1:
                        color = 'warning';
                        text = 'Chờ xác nhận';
                        break;
                    case 2:
                        color = 'success';
                        text = 'Đã xác nhận';
                        break;
                    default:
                        color = 'default';
                        text = 'Không xác định';
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
    ];

    // Columns for top books table
    const bookColumns = [
        {
            title: 'Sách',
            key: 'book',
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        shape="square"
                        size={40}
                        src={"http://localhost:8080" + record.image}
                        style={{ marginRight: 8 }}
                    />
                    <Text ellipsis style={{ width: 200 }}>{record.bookTitle}</Text>
                </div>
            ),
        },
        {
            title: 'Đã bán',
            dataIndex: 'totalSold',
            key: 'totalSold',
            render: (totalSold: number) => <Badge count={totalSold || 0} showZero style={{ backgroundColor: '#52c41a' }} />,
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>Tổng quan</Title>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Tổng người dùng"
                            value={totalUsers}
                            prefix={<UserOutlined />}
                            loading={loadingStats}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Tổng số sách"
                            value={totalBooks}
                            prefix={<BookOutlined />}
                            loading={loadingStats}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={totalOrders}
                            prefix={<ShoppingCartOutlined />}
                            loading={loadingStats}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card bordered={false} style={{ borderRadius: 8 }}>
                        <Statistic
                            title="Doanh thu"
                            value={totalRevenue}
                            prefix={<DollarOutlined />}
                            loading={loadingStats}
                            valueStyle={{ color: '#f5222d' }}
                            formatter={(value) =>
                                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))
                            }
                        />
                    </Card>
                </Col>
            </Row>

            <Divider />

            {/* Recent Orders */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card
                        title={<Title level={4}>Đơn hàng gần đây</Title>}
                        bordered={false}
                        style={{ borderRadius: 8 }}
                    >
                        {loadingOrders ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Spin size="large" />
                            </div>
                        ) : recentOrders.length > 0 ? (
                            <Table
                                dataSource={recentOrders}
                                columns={orderColumns}
                                rowKey="orderID"
                                pagination={false}
                            />
                        ) : (
                            <Empty description="Không có đơn hàng nào" />
                        )}
                    </Card>
                </Col>

                {/* Top Books */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<Title level={4}>Sách bán chạy</Title>}
                        bordered={false}
                        style={{ borderRadius: 8 }}
                    >
                        {loadingBooks ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Spin size="large" />
                            </div>
                        ) : topBooks.length > 0 ? (
                            <Table
                                dataSource={topBooks}
                                columns={bookColumns}
                                rowKey="bookID"
                                pagination={false}
                                size="small"
                            />
                        ) : (
                            <Empty description="Không có sách nào" />
                        )}
                    </Card>
                </Col>
            </Row>

            <Divider />

            {/* Order Status Distribution */}
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title={<Title level={4}>Thống kê đơn hàng</Title>}
                        bordered={false}
                        style={{ borderRadius: 8 }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Card bordered={false} style={{ backgroundColor: '#fff2e8', borderRadius: 8 }}>
                                    <Statistic
                                        title="Đơn hàng đã hủy"
                                        value={orderStatusCounts[0]}
                                        valueStyle={{ color: '#fa541c' }}
                                        loading={loadingStats}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card bordered={false} style={{ backgroundColor: '#fcf4dd', borderRadius: 8 }}>
                                    <Statistic
                                        title="Đơn hàng chờ xác nhận"
                                        value={orderStatusCounts[1]}
                                        valueStyle={{ color: '#fa8c16' }}
                                        loading={loadingStats}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card bordered={false} style={{ backgroundColor: '#f6ffed', borderRadius: 8 }}>
                                    <Statistic
                                        title="Đơn hàng đã xác nhận"
                                        value={orderStatusCounts[2]}
                                        valueStyle={{ color: '#52c41a' }}
                                        loading={loadingStats}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashBoardPage;