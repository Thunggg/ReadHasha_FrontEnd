import { deletePromotionAPI, getPromotionPaginationAPI } from '@/services/api';
import { dateRangeValidate } from '@/services/helper';
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, notification, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import DetailPromotion from './detail.promotion';
import CreatePromotion from './create.promotion';
import EditPromotion from './edit.promotion';
import { useCurrentApp } from '@/components/context/app.context';


type TSearch = {
    proName: string;
    proStatus: number;
    dateRange: string[]; // Thêm trường dateRange để lọc theo ngày bắt đầu và kết thúc
};

const TablePromotion = () => {
    const actionRef = useRef<ActionType>();
    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });

    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<any>(null);

    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);

    const [isDeletePromotion, setIsDeletePromotion] = useState<boolean>(false);

    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<any>(null);
    const { user } = useCurrentApp();



    const handleDeletePromotion = async (proID: number) => {
        setIsDeletePromotion(true);
        try {
            // Lấy username từ context/auth (ví dụ: sử dụng useCurrentApp)
            const username = user?.username || '';

            const res = await deletePromotionAPI(proID, username); // Truyền username
            if (res.statusCode === 200) {
                message.success('Xóa khuyến mãi thành công!');
                if (meta.current > 1 && (meta.total - 1) <= (meta.current - 1) * meta.pageSize) {
                    setMeta((prev) => ({ ...prev, current: prev.current - 1 }));
                }
                actionRef.current?.reload();
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message,
                });
            }
        } catch (error) {
            notification.error({
                message: 'Lỗi hệ thống',
                description: 'Không thể kết nối đến server',
            });
        } finally {
            setIsDeletePromotion(false);
        }
    };

    const columns: ProColumns<any>[] = [
        {
            title: 'ID',
            dataIndex: 'proID',
            hideInSearch: true,
            sorter: true,
        },
        {
            title: 'Khuyến mãi',
            dataIndex: 'proName',
            sorter: true,
            render: (dom, entity) => (
                <a
                    onClick={() => {
                        setOpenViewDetail(true);
                        setDataViewDetail(entity);
                    }}
                >
                    {entity.proName}
                </a>
            ),
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'proCode',
            hideInSearch: true,
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            hideInSearch: true,
            sorter: true,
            render: (_, entity) => <span>{entity.discount}%</span>,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            hideInSearch: true,
            sorter: true,
            render: (_, entity) => (
                <span>{new Date(entity.startDate).toLocaleDateString('vi-VN')}</span>
            ),
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'endDate',
            hideInSearch: true,
            sorter: true,
            render: (_, entity) => (
                <span>{new Date(entity.endDate).toLocaleDateString('vi-VN')}</span>
            ),
        },
        // Thêm cột lọc theo khoảng thời gian
        {
            title: 'Thời gian',
            dataIndex: 'dateRange',
            valueType: 'dateRange',
            hideInTable: true,
            fieldProps: {
                placeholder: ['Ngày bắt đầu', 'Ngày kết thúc'],
            },
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            hideInSearch: true,
            sorter: true,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'proStatus',
            valueType: 'select',
            valueEnum: {
                1: { text: 'Active', status: 'Success' },
                0: { text: 'Inactive', status: 'Error' },
            },
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {record.proStatus === 1 ? (
                        <>
                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                            <span>Active</span>
                        </>
                    ) : (
                        <>
                            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                            <span>Inactive</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            title: 'Action',
            hideInSearch: true,
            render: (_, entity) => (
                <>
                    <EditOutlined
                        style={{ cursor: 'pointer', marginRight: 15, color: '#f57800' }}
                        onClick={() => {
                            setOpenModalUpdate(true);
                            setDataUpdate(entity);
                        }}
                    />
                    <Popconfirm
                        placement="leftTop"
                        title="Xác nhận xóa khuyến mãi"
                        description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
                        onConfirm={() => handleDeletePromotion(entity.proID)}
                        okText="Xác nhận "
                        cancelText="Hủy"
                        okButtonProps={{ loading: isDeletePromotion }}
                    >
                        <DeleteOutlined style={{ cursor: 'pointer', color: '#ff4d4f' }} />
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <>
            <ProTable<any, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort) => {
                    let query = `current=${params.current}&pageSize=${params.pageSize}`;
                    if (params.proName) {
                        query += `&proName=${params.proName}`;
                    }
                    if (params.proStatus !== undefined) {
                        query += `&proStatus=${params.proStatus}`;
                    }

                    // Xử lý lọc theo khoảng thời gian
                    const dateRange = dateRangeValidate(params.dateRange);
                    if (dateRange) {
                        const formattedStartDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
                        const formattedEndDate = dayjs(dateRange[1]).format('YYYY-MM-DD');
                        query += `&startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
                        console.log(query)
                    }

                    // Xử lý sort: nếu có sắp xếp theo các trường cho phép
                    if (sort && Object.keys(sort).length > 0) {
                        if (sort.proID) {
                            query += `&sort=${sort.proID === 'ascend' ? 'proID' : '-proID'}`;
                        } else if (sort.proName) {
                            query += `&sort=${sort.proName === 'ascend' ? 'proName' : '-proName'}`;
                        } else if (sort.discount) {
                            query += `&sort=${sort.discount === 'ascend' ? 'discount' : '-discount'}`;
                        } else if (sort.startDate) {
                            query += `&sort=${sort.startDate === 'ascend' ? 'startDate' : '-startDate'}`;
                        } else if (sort.endDate) {
                            query += `&sort=${sort.endDate === 'ascend' ? 'endDate' : '-endDate'}`;
                        } else if (sort.quantity) {
                            query += `&sort=${sort.quantity === 'ascend' ? 'quantity' : '-quantity'}`;
                        }
                    }
                    const res = await getPromotionPaginationAPI(query);
                    if (res && res.data && res.data.meta) {
                        setMeta(res.data.meta);
                    }
                    return {
                        data: res.data?.result,
                        success: true,
                        total: res.data?.meta.total,
                    };

                }}
                rowKey="proID"
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50, 100],
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>
                            {range[0]} - {range[1]} trên {total} bản ghi
                        </div>
                    ),
                }}
                headerTitle="Danh sách khuyến mãi"
                toolBarRender={() => [
                    <Button
                        key="add"
                        icon={<PlusOutlined />}
                        onClick={() => setOpenModalCreate(true)}
                        type="primary"
                    >
                        Thêm mới
                    </Button>,
                ]}
            />

            <DetailPromotion
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
            />

            <CreatePromotion
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                reloadTable={() => actionRef.current?.reload()}
            />

            <EditPromotion
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                dataUpdate={dataUpdate}
                reloadTable={() => actionRef.current?.reload()}
            />
        </>
    );
};

export default TablePromotion;
