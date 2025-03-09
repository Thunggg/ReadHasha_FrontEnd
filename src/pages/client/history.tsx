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
    const { notification } = App.useApp();
    const { user } = useCurrentApp();

    // Định nghĩa các cột của Table với phân trang và sắp xếp
    const columns: TableProps<IHistory>["columns"] = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            render: (_, __, index) => <span>{index + 1}</span>,
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
                { text: "Đã đặt hàng", value: 1 },
                { text: "Đã thanh toán", value: 2 },
            ],
            onFilter: (value, record) => record.orderStatus === value,
            render: (_, record) => {
                const statusText = record.orderStatus === 1
                    ? "Đã đặt hàng"
                    : record.orderStatus === 2
                        ? "Đã thanh toán"
                        : "Khác";
                return <Tag color={record.orderStatus === 1 ? "volcano" : "green"}>{statusText}</Tag>;
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
            <h3>Lịch sử mua hàng</h3>
            <Button type="primary" onClick={fetchData} style={{ marginBottom: 16 }}>
                Refresh
            </Button>
            <Divider />
            <Table
                bordered
                columns={columns}
                dataSource={dataHistory}
                rowKey={"orderID"}
                loading={loading}
                pagination={{ pageSize: 10 }}
                locale={{
                    emptyText: <Empty description="Không có đơn hàng nào" />,
                }}
            />
            <Drawer
                title="Chi tiết đơn hàng"
                width={400}
                onClose={() => {
                    setOpenDetail(false);
                    setDataDetail(null);
                }}
                open={openDetail}
            >
                {dataDetail?.orderDetailList?.length ? (
                    dataDetail.orderDetailList.map((item: any, index: number) => (
                        <Card key={index} style={{ marginBottom: 16 }}>
                            <img
                                src={"http://localhost:8080" + item.bookID.image}
                                alt={item.bookID.bookTitle}
                                style={{ width: "100%", maxHeight: 150, objectFit: "contain", marginBottom: 10 }}
                            />
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label="Tên sách">{item.bookID.bookTitle}</Descriptions.Item>
                                <Descriptions.Item label="Tác giả">{item.bookID.author}</Descriptions.Item>
                                <Descriptions.Item label="Số lượng">{item.quantity}</Descriptions.Item>
                                <Descriptions.Item label="Giá">
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(item.bookID.bookPrice)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    ))
                ) : (
                    <Empty description="Không có chi tiết đơn hàng" />
                )}
            </Drawer>
        </div>
    );
};

export default HistoryPage;
