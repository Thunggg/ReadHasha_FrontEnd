// import { getUserAPI } from '@/services/api';
import { deleteUserAPI, getUserAPI } from '@/services/api';
import { dateRangeValidate } from '@/services/helper';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteTwoTone, EditTwoTone, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, message, notification, Popconfirm } from 'antd';
import { useRef, useState } from 'react';
import DetailUser from './detail.user';
import CreateUser from './create.user';
import UpdateUser from './update.user';
import dayjs from 'dayjs';


type TSearch = {
    userName: string;
    email: string;
    createdAt: string;
    createdAtRange: string;
}



const TableUser = () => {
    const actionRef = useRef<ActionType>();

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });


    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IUser | null>(null);

    const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);

    const [isDeleteUser, setIsDeleteUser] = useState<boolean>(false);

    const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
    const [dataUpdate, setDataUpdate] = useState<IUser | null>(null);

    const refreshTable = () => {
        actionRef.current?.reload();
    }

    const handleDeleteUser = async (userName: string) => {
        setIsDeleteUser(true)
        const res = await deleteUserAPI(userName);
        if (res.statusCode == 200) {
            message.success('Xóa user thành công');
            refreshTable();
        } else {
            notification.error({
                message: 'Đã có lỗi xảy ra',
                description: res.message
            })
        }
        setIsDeleteUser(false)
    }

    const columns: ProColumns<IUser>[] = [
        {
            dataIndex: 'index',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'User name',
            dataIndex: 'userName',
            render(dom, entity, index, action, schema) {
                return (
                    <>
                        <a onClick={() => {
                            setOpenViewDetail(true);
                            setDataViewDetail(entity);
                        }}>{entity.username}</a>
                    </>
                )
            },
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                return (
                    <>
                        <div>{entity.firstName} {entity.lastName}</div>
                    </>
                )
            },
        },
        {
            title: 'Email',
            dataIndex: 'email',
            copyable: true,
        },
        {
            title: 'Date of birthday',
            dataIndex: 'dob',
            valueType: 'date',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: 'DOB',
            dataIndex: 'createdAtRange',
            valueType: 'dateRange',
            hideInTable: true,
        },
        {
            title: 'Status',
            dataIndex: 'accStatus',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {entity.accStatus === 1 ? (
                            <>
                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                <span>Active</span>
                            </>
                        ) : entity.accStatus === 0 ? (
                            <>
                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                <span>Inactive</span>
                            </>
                        ) : (
                            <>
                                <ClockCircleOutlined style={{ color: '#faad14' }} />
                                <span>Pending</span>
                            </>
                        )}
                    </div>
                )
            },
        },
        {
            title: 'Action',
            hideInSearch: true,
            render(dom, entity, index, action, schema) {
                return (
                    <>
                        <EditTwoTone
                            twoToneColor="#f57800"
                            style={{ cursor: "pointer", marginRight: 15 }}
                            onClick={() => {
                                setDataUpdate(entity);
                                setOpenModalUpdate(true);
                            }}
                        />
                        <Popconfirm
                            placement="leftTop"
                            title={"Xác nhận xóa user"}
                            description={"Bạn có chắc chắn muốn xóa user này ?"}
                            onConfirm={() => handleDeleteUser(entity.username)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ loading: isDeleteUser }}
                        >
                            <span style={{ cursor: "pointer", marginLeft: 20 }}>
                                <DeleteTwoTone
                                    twoToneColor="#ff4d4f"
                                    style={{ cursor: "pointer" }}
                                />
                            </span>
                        </Popconfirm>
                    </>
                );
            },
        },

    ];

    return (
        <>
            <ProTable<IUser, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    let query = "";
                    if (params) {
                        query += `current=${params.current}&pageSize=${params.pageSize}`
                        if (params.email) {
                            query += `&email=${params.email}`
                        }
                        if (params.userName) {
                            query += `&userName=${params.userName}`
                        }

                        const createDateRange = dateRangeValidate(params.createdAtRange);
                        if (createDateRange) {
                            const formattedStart = dayjs(createDateRange[0]).format('YYYY-MM-DD');
                            const formattedEnd = dayjs(createDateRange[1]).format('YYYY-MM-DD');
                            query += `&startDob=${formattedStart}&endDob=${formattedEnd}`;
                        }
                    }
                    if (sort && sort.dob) {
                        query += `&sort=${sort.dob === "ascend" ? "dob" : "-dob"}`
                    } else query += `&sort=-dob`;

                    const res = await getUserAPI(query);
                    if (res.data) {
                        setMeta(res.data.meta);
                    }
                    return {
                        data: res.data?.result,
                        page: 1,
                        success: true,
                        total: res.data?.meta.total
                    }
                }}
                rowKey="userName"
                pagination={
                    {
                        current: meta.current,
                        pageSize: meta.pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: [5, 10, 20, 50, 100],
                        total: meta.total,
                        showTotal: (total, range) => { return (<div>{range[0]} - {range[1]} trên {total} rows</div>) }
                    }
                }
                headerTitle="Table user"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setOpenModalCreate(true);
                        }}
                        type="primary"
                    >
                        Thêm mới
                    </Button>
                ]}

            />
            <DetailUser
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />

            <CreateUser
                openModalCreate={openModalCreate}
                setOpenModalCreate={setOpenModalCreate}
                refreshTable={refreshTable}
            />

            <UpdateUser
                openModalUpdate={openModalUpdate}
                setOpenModalUpdate={setOpenModalUpdate}
                dataUpdate={dataUpdate}
                setDataUpdate={setDataUpdate}
                refreshTable={refreshTable}
            />
        </>
    );
};

export default TableUser