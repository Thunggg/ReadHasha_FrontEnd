// import { getUserAPI } from '@/services/api';
import { getUserAPI } from '@/services/api';
import { dateRangeValidate } from '@/services/helper';
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Badge, Button, Divider } from 'antd';
import { useRef, useState } from 'react';
import DetailUser from './detail.user';


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
            title: 'Created At',
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
                        <EditOutlined
                            style={{ cursor: 'pointer', marginRight: 15, color: '#f57800' }}
                        />
                        <DeleteOutlined
                            style={{ cursor: 'pointer', marginRight: 15, color: '#ff4d4f' }}
                        />
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

                    console.log(params, sort, filter);

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
                            query += `&createdAt=${createDateRange[0]}&createdAt=${createDateRange[1]}`
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
                            actionRef.current?.reload();
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
        </>
    );
};

export default TableUser