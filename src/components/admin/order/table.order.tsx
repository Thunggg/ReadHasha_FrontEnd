import React, { useRef, useState } from 'react';
import { dateRangeValidate } from '@/services/helper';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Tag, Tooltip, Space, Typography, Avatar } from 'antd';
import dayjs from 'dayjs';
import { getOrderPaginationAPI } from '@/services/api';
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
    2: { text: 'Đang xử lý', color: 'processing', icon: <ClockCircleOutlined /> },
    3: { text: 'Đang giao hàng', color: 'processing', icon: <ClockCircleOutlined /> },
    4: { text: 'Đã giao hàng', color: 'success', icon: <CheckCircleOutlined /> },
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
            // defaultHidden: true,
            render: (text) => <Text type="secondary">{text}</Text>,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'orderDetailList',
            hideInSearch: true,
            sorter: true,
            render: (_, record) => (
                <Text strong style={{ color: '#f5222d' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateOrderTotal(record.orderDetailList))}
                </Text>
            ),
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
                2: { text: 'Đang xử lý', status: 'Processing' },
                3: { text: 'Đang giao hàng', status: 'Processing' },
                4: { text: 'Đã giao hàng', status: 'Success' },
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
                <Tooltip title="Xuất hóa đơn PDF" key="pdf">
                    <Button
                        type="link"
                        icon={<FilePdfOutlined />}
                        onClick={() => {
                            // Xử lý xuất PDF
                            console.log('Export PDF for order:', record.orderID);
                        }}
                    />
                </Tooltip>,
            ],
        },
    ];

    return (
        <>
            <ProTable<IOrder, TSearch>
                columns={columns}
                actionRef={actionRef}
                onChange={() => { console.log("OK") }}
                cardBordered
                request={async (params, sort, filter) => {
                    let query = `current=${params.current}&pageSize=${params.pageSize}`;

                    if (params.orderID) {
                        query += `&orderID=${params.orderID}`;
                    }

                    if (params.customerName) {
                        query += `&customerName=${params.customerName}`;
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
                        }
                    } else {
                        // Mặc định sắp xếp theo thời gian tạo giảm dần (mới nhất lên đầu)
                        query += `&sort=-orderDate`;
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

            {/* <DetailOrder
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
            /> */}
        </>
    );
};

export default TableOrder;