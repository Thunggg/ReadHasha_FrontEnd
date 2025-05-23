import React, { useRef, useState } from 'react';
import { dateRangeValidate } from '@/services/helper';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, FilePdfOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Tag, Tooltip, Space, Typography, Avatar, message, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { getOrderPaginationAPI, approveOrderAPI, updateOrderStatusAPI, cancelOrderAndRestoreStockAPI } from '@/services/api';
import DetailOrder from './detail.order';
import { useCurrentApp } from '@/components/context/app.context';
// import DetailOrder from './detail.order';

const { Text } = Typography;

type TSearch = {
    orderID: number;
    customerName: string;
    orderStatus: number;
    dateRange: string[];
};

// Mapping trạng thái đơn hàng
const orderStatusMap = {
    0: { text: 'Đã hủy', color: 'error', icon: <CloseCircleOutlined /> },
    1: { text: 'Chờ xác nhận', color: 'warning', icon: <ClockCircleOutlined /> },
    2: { text: 'Đã xác nhận', color: 'success', icon: <CheckCircleOutlined /> },
};

const TableOrder: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });

    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IOrder | null>(null);
    const [confirmingOrderId, setConfirmingOrderId] = useState<number | null>(null);
    const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
    const { user } = useCurrentApp();

    // Tính tổng tiền của đơn hàng
    const calculateOrderTotal = (orderDetails: IOrderDetail[]): number => {
        return orderDetails.reduce((total, item) => total + item.totalPrice, 0);
    };

    // Lấy thông tin sách đầu tiên trong đơn hàng để hiển thị
    const getFirstBookInfo = (orderDetails: IOrderDetail[]) => {
        if (orderDetails && orderDetails.length > 0) {
            return {
                title: orderDetails[0].bookID.bookTitle,
                image: orderDetails[0].bookID.image,
                quantity: orderDetails[0].quantity,
                moreItems: orderDetails.length > 1 ? orderDetails.length - 1 : 0
            };
        }
        return { title: 'Không có sản phẩm', image: '', quantity: 0, moreItems: 0 };
    };

    // Add function to handle order confirmation
    const handleConfirmOrder = async (orderId: number) => {
        if (!user || !user.username) {
            message.error('Bạn cần đăng nhập để thực hiện thao tác này');
            return;
        }

        setConfirmingOrderId(orderId);
        try {
            const res = await approveOrderAPI(orderId, user.username);
            if (res.statusCode === 200) {
                message.success('Đã xác nhận đơn hàng thành công!');
                actionRef.current?.reload();
            } else {
                message.error('Có lỗi xảy ra khi xác nhận đơn hàng: ' + res.message);
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            message.error('Không thể kết nối đến server hoặc có lỗi xảy ra');
        } finally {
            setConfirmingOrderId(null);
        }
    };

    // Add function to handle order cancellation
    const handleCancelOrder = async (orderId: number) => {
        if (!user || !user.username) {
            message.error('Bạn cần đăng nhập để thực hiện thao tác này');
            return;
        }

        setCancellingOrderId(orderId);
        try {
            const res = await cancelOrderAndRestoreStockAPI(orderId);
            if (res.statusCode === 200) {
                message.success('Đã hủy đơn hàng');
                actionRef.current?.reload();
            } else {
                message.error('Có lỗi xảy ra khi hủy đơn hàng: ' + res.message);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            message.error('Không thể kết nối đến server hoặc có lỗi xảy ra');
        } finally {
            setCancellingOrderId(null);
        }
    };

    const columns: ProColumns<IOrder>[] = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderID',
            render: (_, record) => (
                <a
                    onClick={() => {
                        setOpenViewDetail(true);
                        setDataViewDetail(record);
                    }}
                >
                    #{record.orderID}
                </a>
            ),
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'orderDetailList',
            hideInSearch: true,
            render: (_, record) => {
                const bookInfo = getFirstBookInfo(record.orderDetailList);
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {bookInfo.image ? (
                            <Avatar
                                shape="square"
                                size={64}
                                src={"http://localhost:8080" + bookInfo.image}
                                style={{ marginRight: 12 }}
                            />
                        ) : (
                            <Avatar shape="square" size={64} style={{ marginRight: 12 }}>No Image</Avatar>
                        )}
                        <div>
                            <Text ellipsis style={{ width: 200 }} title={bookInfo.title}>
                                {bookInfo.title}
                            </Text>
                            {bookInfo.moreItems > 0 && (
                                <div>
                                    <Text type="secondary">+{bookInfo.moreItems} sản phẩm khác</Text>
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customerName',
            render: (text) => <Text>{text}</Text>,
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'orderAddress',
            hideInSearch: true,
            ellipsis: false,
            // defaultHidden: true as any,
            render: (text) => <Text type="secondary">{text}</Text>,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice', // Đặt dataIndex là totalPrice để hỗ trợ sắp xếp
            hideInSearch: true,
            sorter: true, // Cho phép sắp xếp
            render: (_, record) => {
                const total = calculateOrderTotal(record.orderDetailList);
                return (
                    <Text strong style={{ color: '#f5222d' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                    </Text>
                );
            },
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'orderDate',
            hideInSearch: true,
            sorter: true,
            render: (text: any) => <span>{dayjs(text).format('DD/MM/YYYY')}</span>,
        },
        {
            title: 'Thời gian đặt hàng',
            dataIndex: 'dateRange',
            valueType: 'dateRange',
            hideInTable: true,
            fieldProps: {
                placeholder: ['Từ ngày', 'Đến ngày'],
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'orderStatus',
            valueType: 'select',
            valueEnum: {
                0: { text: 'Đã hủy', status: 'Error' },
                1: { text: 'Chờ xác nhận', status: 'Warning' },
                2: { text: 'Đã xác nhận', status: 'Success' },
            },
            render: (_, record) => {
                const status = orderStatusMap[record.orderStatus as keyof typeof orderStatusMap];
                return status ? (
                    <Tag icon={status.icon} color={status.color}>
                        {status.text}
                    </Tag>
                ) : (
                    <Tag>Không xác định</Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            valueType: 'option',
            render: (_, record) => [
                <Tooltip title="Xem chi tiết" key="view">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataViewDetail(record);
                        }}
                    />
                </Tooltip>,
                record.orderStatus === 1 ? (
                    <Tooltip title="Xác nhận đơn hàng" key="confirm">
                        <Popconfirm
                            title="Xác nhận đơn hàng"
                            description="Bạn có chắc chắn muốn xác nhận đơn hàng này?"
                            onConfirm={() => handleConfirmOrder(record.orderID)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="link"
                                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                                loading={confirmingOrderId === record.orderID}
                            />
                        </Popconfirm>
                    </Tooltip>
                ) : (
                    <></>
                ),
                (record.orderStatus === 1 || record.orderStatus === 2) ? (
                    <Tooltip title="Hủy đơn hàng" key="cancel">
                        <Popconfirm
                            title="Hủy đơn hàng"
                            description="Bạn có chắc chắn muốn hủy đơn hàng này?"
                            onConfirm={() => handleCancelOrder(record.orderID)}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                loading={cancellingOrderId === record.orderID}
                            />
                        </Popconfirm>
                    </Tooltip>
                ) : (
                    <></>
                ),
            ],
        },
    ];

    return (
        <>
            <ProTable<IOrder, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    let query = `current=${params.current}&pageSize=${params.pageSize}`;

                    if (params.orderID) {
                        query += `&orderID=${params.orderID}`;
                    }

                    if (params.customerName) {
                        query += `&username=${params.customerName}`;
                    }

                    if (params.orderStatus !== undefined) {
                        query += `&orderStatus=${params.orderStatus}`;
                    }

                    // Xử lý lọc theo khoảng thời gian
                    const dateRange = dateRangeValidate(params.dateRange);
                    if (dateRange) {
                        const formattedStartDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
                        const formattedEndDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
                        query += `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
                    }

                    // Xử lý sort
                    if (sort) {
                        if (sort.orderDate) {
                            query += `&sort=${sort.orderDate === 'ascend' ? 'orderDate' : '-orderDate'}`;
                        } else if (sort.totalPrice) {
                            // Gửi sort totalPrice đến backend
                            query += `&sort=${sort.totalPrice === 'ascend' ? 'totalPrice' : '-totalPrice'}`;
                        } else if (sort.orderID) {
                            query += `&sort=${sort.orderID === 'ascend' ? 'orderID' : '-orderID'}`;
                        }
                    } else {
                        // Mặc định sắp xếp theo orderID giảm dần (mới nhất trước)
                        query += `&sort=-orderID`;
                    }

                    const res = await getOrderPaginationAPI(query);
                    if (res && res.data && res.data.meta) {
                        setMeta(res.data.meta);
                    }

                    return {
                        data: res.data?.result || [],
                        success: true,
                        total: res.data?.meta.total || 0,
                    };
                }}
                rowKey="orderID"
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50, 100],
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>
                            {range[0]} - {range[1]} trên {total} đơn hàng
                        </div>
                    ),
                }}
                search={{
                    labelWidth: 'auto',
                }}
                dateFormatter="string"
                headerTitle={
                    <Space>
                        <span>Quản lý đơn hàng</span>
                        <Tag color="blue">Tổng số: {meta.total}</Tag>
                    </Space>
                }
                columnsState={{
                    persistenceKey: 'order-table-columns',
                    persistenceType: 'localStorage',
                    defaultValue: {
                        orderAddress: { show: false }, // Mặc định ẩn cột địa chỉ
                    },
                }}
                options={{
                    setting: {
                        listsHeight: 400,
                        draggable: true,
                        checkable: true,
                    },
                }}
                toolbar={{
                    actions: [],
                }}
            />

            <DetailOrder
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                reloadTable={() => actionRef.current?.reload()}
            />
        </>
    );
};

export default TableOrder;