import { getBookAPI, getUserAPI } from '@/services/api';
import { CheckCircleOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, Divider } from 'antd';
import { useRef, useState } from 'react';
import DetailBook from './detail.book';

type TSearch = {
    bookTitle: string;
    author: string;
    translator: string;
    bookStatus: number;
}


const TableBook = () => {
    const actionRef = useRef<ActionType>();

    const [meta, setMeta] = useState({
        current: 1,
        pageSize: 5,
        pages: 0,
        total: 0,
    });

    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [dataViewDetail, setDataViewDetail] = useState<IBook | null>(null);


    const columns: ProColumns<IBook>[] = [
        {
            title: 'Book ID',
            dataIndex: 'bookID',
            hideInSearch: true,
        },
        {
            title: 'Title',
            dataIndex: 'bookTitle',
            render(dom, entity, index, action, schema) {
                return (
                    <>
                        <a onClick={() => {
                            setOpenViewDetail(true);
                            setDataViewDetail(entity);
                            console.log(entity);
                        }}>{entity.bookTitle}</a>
                    </>
                )
            },
        },
        {
            title: 'Author',
            dataIndex: 'author',
        },
        {
            title: 'Translator',
            dataIndex: 'translator',
        },
        {
            title: 'Quantity',
            dataIndex: 'bookQuantity',
            hideInSearch: true,
            sorter: true
        },
        {
            title: 'Price',
            hideInSearch: true,
            dataIndex: 'bookPrice',
            sorter: true,
            render: (_, record) =>
                new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(record.bookPrice),
        },
        {
            title: 'Status',
            dataIndex: 'bookStatus',
            valueType: 'select',
            valueEnum: {
                1: { text: 'Active', status: 'Success' },
                0: { text: 'Inactive', status: 'Error' },
            },
            render(dom, entity, index, action, schema) {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {entity.bookStatus === 1 ? (
                            <>
                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                <span>Active</span>
                            </>
                        )
                            :
                            (
                                <>
                                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                    <span>Inactive</span>
                                </>
                            )}
                    </div>
                )
            },

        },
        {
            title: 'Action',
            hideInSearch: true,
            render: (_, entity) => (
                <>
                    <EditOutlined
                        style={{ cursor: 'pointer', marginRight: 15, color: '#f57800' }}
                        onClick={() => {

                        }}
                    />
                    <DeleteOutlined
                        style={{ cursor: 'pointer', marginRight: 15, color: '#ff4d4f' }}
                        onClick={() => console.log("Delete", entity.bookID)}
                    />
                </>
            ),
        },

    ];

    return (
        <>
            <ProTable<IBook, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params)
                    let query = "";
                    if (params) {
                        query += `current=${params.current}&pageSize=${params.pageSize}`
                        if (params.bookTitle) {
                            query += `&bookTitle=${params.bookTitle}`
                        }
                        if (params.author) {
                            query += `&author=${params.author}`
                        }
                        if (params.translator) {
                            query += `&translator=${params.translator}`
                        }
                        if (params.bookStatus) {
                            query += `&bookStatus=${params.bookStatus}`
                        }
                    }

                    // Xử lý sort Price và Quantity
                    if (sort.bookPrice) {
                        query += `&sort=${sort.bookPrice === 'ascend' ? 'bookPrice' : '-bookPrice'}`;
                    }
                    if (sort.bookQuantity) {
                        query += `&sort=${sort.bookQuantity === 'ascend' ? 'bookQuantity' : '-bookQuantity'}`;
                    }

                    const res = await getBookAPI(query);
                    console.log(res);
                    if (res.data) {
                        setMeta(res.data.meta);
                    }
                    return {
                        data: res.data?.result,
                        page: 1,
                        success: true,
                        total: res.data?.meta.total
                    };
                }}
                rowKey="bookID"
                pagination={{
                    current: meta.current,
                    pageSize: meta.pageSize,
                    showSizeChanger: true,
                    pageSizeOptions: [5, 10, 20, 50, 100],
                    total: meta.total,
                    showTotal: (total, range) => (
                        <div>{range[0]} - {range[1]} trên {total} rows</div>
                    ),
                }}
                headerTitle="Book List"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => actionRef.current?.reload()}
                        type="primary"
                    >
                        Add new
                    </Button>
                ]}
            />
            <DetailBook
                openViewDetail={openViewDetail}
                setOpenViewDetail={setOpenViewDetail}
                dataViewDetail={dataViewDetail}
                setDataViewDetail={setDataViewDetail}
            />
        </>

    );
};

export default TableBook;