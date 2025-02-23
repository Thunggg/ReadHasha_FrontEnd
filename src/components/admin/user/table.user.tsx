// import { getUserAPI } from '@/services/api';
import { getUserAPI } from '@/services/api';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Divider } from 'antd';
import { useRef, useState } from 'react';


const columns: ProColumns<IUser>[] = [
    {
        dataIndex: 'index',
        valueType: 'indexBorder',
        width: 48,
    },
    {
        title: 'User name',
        dataIndex: 'userName',
        hideInSearch: true,
        render(dom, entity, index, action, schema) {
            return (
                <>
                    <a href="">{entity.username}</a>
                </>
            )
        },
    },
    {
        title: 'Full Name',
        dataIndex: 'fullName',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        copyable: true,
    },
    {
        title: 'Create At',
        dataIndex: 'createdAt',
    },
    {
        title: 'Action',
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

const TableUser = () => {
    const actionRef = useRef<ActionType>();

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });

    return (
        <ProTable<IUser>
            columns={columns}
            actionRef={actionRef}
            cardBordered
            request={async (sort, filter) => {
                console.log(sort, filter);
                const res = await getUserAPI();
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
    );
};

export default TableUser