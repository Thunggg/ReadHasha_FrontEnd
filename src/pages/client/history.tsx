import { useEffect, useState } from "react";
import { App, Button, Card, Descriptions, Divider, Drawer, Empty, Table, Tag } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { FORMATE_DATE_VN } from "@/services/helper";
import { getHistoryAPI } from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";

const HistoryPage = () => {
    const [dataHistory, setDataHistory] = useState<IHistory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [openDetail, setOpenDetail] = useState<boolean>(false);
    const [dataDetail, setDataDetail] = useState<IHistory | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const { notification } = App.useApp();
    const { user } = useCurrentApp();

    // Định nghĩa các cột của Table với phân trang và sắp xếp
    const columns: TableProps<IHistory>["columns"] = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (_, __, index) => {
                // Calculate actual index based on current page and page size
                return <span>{(pagination.current - 1) * pagination.pageSize + index + 1}</span>;
            },
        },
        {
            title: 'Thời gian',
            dataIndex: 'orderDate',
            sorter: (a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
            render: (text) => dayjs(text).format(FORMATE_DATE_VN),
        },
        {
            title: 'Tổng số tiền',
            key: 'totalPrice',
            sorter: (a, b) => {
                const totalA = a.orderDetailList.reduce((acc: any, detail: any) => acc + detail.totalPrice, 0);
                const totalB = b.orderDetailList.reduce((acc: any, detail: any) => acc + detail.totalPrice, 0);
                return totalA - totalB;
            },
            render: (_, record) => {
                const total = record.orderDetailList.reduce((acc: any, detail: any) => acc + detail.totalPrice, 0);
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total);
            },
        },
        {
            title: 'Trạng thái',
            key: 'orderStatus',
            filters: [
                { text: "Đã hủy", value: 0 },
                { text: "Chờ xác nhận", value: 1 },
                { text: "Đã xác nhận", value: 2 },
            ],
            onFilter: (value, record) => record.orderStatus === value,
            render: (_, record) => {
                let statusText = "";
                let color = "";

                switch (record.orderStatus) {
                    case 0:
                        statusText = "Đã hủy";
                        color = "error";
                        break;
                    case 1:
                        statusText = "Chờ xác nhận";
                        color = "warning";
                        break;
                    case 2:
                        statusText = "Đã xác nhận";
                        color = "success";
                        break;
                    default:
                        statusText = "Không xác định";
                        color = "default";
                }

                return <Tag color={color}>{statusText}</Tag>;
            },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'orderAddress',
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <a
                    onClick={() => {
                        setOpenDetail(true);
                        setDataDetail(record);
                    }}
                    href="#"
                >
                    Xem chi tiết
                </a>
            ),
        },
    ];

    const fetchData = async () => {
        setLoading(true);
        const username = user?.username;
        if (!username) {
            notification.error({
                message: "Lỗi",
                description: "Không tìm thấy thông tin người dùng.",
            });
            setLoading(false);
            return;
        }
        try {
            const res = await getHistoryAPI(username);
            if (res && res.data) {
                setDataHistory(res.data);
            } else {
                notification.error({
                    message: "Đã có lỗi xảy ra",
                    description: res.message || "Lỗi khi lấy lịch sử mua hàng",
                });
            }
        } catch (error: any) {
            notification.error({
                message: "Lỗi hệ thống",
                description: error.response?.data?.message || "Lỗi kết nối đến máy chủ",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [notification, user]);

    return (
        <div style={{ margin: 50 }}>
            <Table
                bordered
                columns={columns}
                dataSource={dataHistory}
                rowKey={"orderID"}
                loading={loading}
                pagination={{
                    pageSize: pagination.pageSize,
                    current: pagination.current,
                    onChange: (page, pageSize) => {
                        setPagination({ current: page, pageSize: pageSize || 10 });
                    }
                }}
                locale={{
                    emptyText: <Empty description="Không có đơn hàng nào" />,
                }}
            />
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Chi tiết đơn hàng {dataDetail?.orderID ? `#${dataDetail.orderID}` : ''}</span>
                        {dataDetail?.orderStatus !== undefined && (
                            <Tag color={
                                dataDetail.orderStatus === 0 ? "error" :
                                    dataDetail.orderStatus === 1 ? "warning" : "success"
                            }>
                                {dataDetail.orderStatus === 0 ? "Đã hủy" :
                                    dataDetail.orderStatus === 1 ? "Chờ xác nhận" : "Đã xác nhận"}
                            </Tag>
                        )}
                    </div>
                }
                width={500}
                onClose={() => {
                    setOpenDetail(false);
                    setDataDetail(null);
                }}
                open={openDetail}
            >
                {dataDetail?.orderDetailList?.length ? (
                    <>
                        <Card style={{ marginBottom: 16 }}>
                            <Descriptions column={1} size="small" title="Thông tin đơn hàng">
                                <Descriptions.Item label="Ngày đặt">
                                    {dataDetail.orderDate ? dayjs(dataDetail.orderDate).format(FORMATE_DATE_VN) : "N/A"}
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ giao hàng">
                                    {dataDetail.orderAddress || "N/A"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <h4 style={{ margin: '16px 0 8px 0' }}>Danh sách sản phẩm</h4>

                        {dataDetail.orderDetailList.map((item: any, index: number) => (
                            <Card
                                key={index}
                                style={{
                                    marginBottom: 16,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div style={{ display: 'flex' }}>
                                    <div style={{ width: '35%', padding: '0 10px 0 0' }}>
                                        <img
                                            src={"http://localhost:8080" + item.bookID.image}
                                            alt={item.bookID.bookTitle}
                                            style={{
                                                width: "100%",
                                                maxHeight: 120,
                                                objectFit: "contain"
                                            }}
                                        />
                                    </div>
                                    <div style={{ width: '65%' }}>
                                        <h4 style={{ margin: '0 0 8px 0' }}>{item.bookID.bookTitle}</h4>
                                        <p style={{ color: '#666', margin: '0 0 5px 0' }}>Tác giả: {item.bookID.author}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div>
                                                    <span style={{ color: '#999', textDecoration: item.discountAtPurchase > 0 ? 'line-through' : 'none' }}>
                                                        {new Intl.NumberFormat("vi-VN", {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }).format(item.bookID.bookPrice)}
                                                    </span>
                                                    {item.discountAtPurchase > 0 && (
                                                        <Tag color="green" style={{ marginLeft: 8 }}>
                                                            -{item.discountAtPurchase}%
                                                        </Tag>
                                                    )}
                                                </div>
                                                <div>SL: {item.quantity}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <Divider />
                        <Card
                            style={{
                                marginTop: 16,
                                backgroundColor: '#f9f9f9',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}
                        >
                            <h4 style={{ margin: '0 0 16px 0', borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                                Thông tin thanh toán
                            </h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                                <span>Tổng tiền hàng:</span>
                                <span>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(dataDetail.orderDetailList.reduce((acc: number, item: any) =>
                                        acc + (item.bookID.bookPrice * item.quantity), 0))}
                                </span>
                            </div>

                            {/* Display promo code if it exists in the data */}
                            {dataDetail && (dataDetail as any).promoCode && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
                                    <span>Mã giảm giá:</span>
                                    <Tag color="blue">{(dataDetail as any).promoCode}</Tag>
                                </div>
                            )}

                            {/* Display discount if there's a difference between original and final prices */}
                            {(() => {
                                const originalTotal = dataDetail.orderDetailList.reduce((acc: number, item: any) =>
                                    acc + (item.bookID.bookPrice * item.quantity), 0);
                                const finalTotal = dataDetail.orderDetailList.reduce((acc: number, item: any) =>
                                    acc + item.totalPrice, 0);

                                if (originalTotal > finalTotal) {
                                    const savedAmount = originalTotal - finalTotal;
                                    const discountPercent = Math.round((savedAmount / originalTotal) * 100);

                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', color: '#52c41a' }}>
                                            <span>Tiết kiệm:</span>
                                            <span>
                                                -{new Intl.NumberFormat("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(savedAmount)} ({discountPercent}%)
                                            </span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                margin: '16px 0 8px',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                borderTop: '1px solid #eee',
                                paddingTop: 16
                            }}>
                                <span>Tổng thanh toán:</span>
                                <span style={{ color: '#f50' }}>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(dataDetail.orderDetailList.reduce((acc: number, item: any) =>
                                        acc + item.totalPrice, 0))}
                                </span>
                            </div>
                        </Card>
                    </>
                ) : (
                    <Empty description="Không có chi tiết đơn hàng" />
                )}
            </Drawer>
        </div>
    );
};

export default HistoryPage;
