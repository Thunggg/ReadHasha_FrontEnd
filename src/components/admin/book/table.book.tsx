import {
  deleteBookAPI,
  getBookAPI,
  getCategoryAPI,
  getUserAPI,
} from "@/services/api";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  DeleteTwoTone,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button, Divider, message, notification, Popconfirm } from "antd";
import { useRef, useState } from "react";
import DetailBook from "./detail.book";
import CreateBook from "./create.book";
import EditBook from "./update.book";

type TSearch = {
  bookTitle: string;
  author: string;
  translator: string;
  bookStatus: number;
};

const TableBook = () => {
  const actionRef = useRef<ActionType>();

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<IBook | null>(null);

  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [categoryData, setCategoryData] = useState<ICategory[]>([]);

  const [isDeleteBook, setIsDeleteBook] = useState<boolean>(false);

  const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
  const [dataUpdate, setDataUpdate] = useState<IBook | null>(null);

  const handleDeleteBook = async (bookID: number) => {
    setIsDeleteBook(true);
    const res = await deleteBookAPI(bookID);
    if (res.statusCode == 200) {
      message.success("Xóa sách thành công!");
      refreshTable();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsDeleteBook(false);
  };

  const columns: ProColumns<IBook>[] = [
    {
      title: "Mã sách",
      dataIndex: "bookID",
      hideInSearch: true,
    },
    {
      title: "Tiêu đề",
      dataIndex: "bookTitle",
      render(dom, entity, index, action, schema) {
        return (
          <>
            <a
              onClick={() => {
                setOpenViewDetail(true);
                setDataViewDetail(entity);
              }}
            >
              {entity.bookTitle}
            </a>
          </>
        );
      },
    },
    {
      title: "Tác giả",
      dataIndex: "author",
    },
    {
      title: "Dịch giả",
      dataIndex: "translator",
    },
    {
      title: "Số lượng",
      dataIndex: "bookQuantity",
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Giá",
      hideInSearch: true,
      dataIndex: "bookPrice",
      sorter: true,
      render: (_, record) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(record.bookPrice),
    },
    {
      title: "Trạng thái",
      dataIndex: "bookStatus",
      valueType: "select",
      valueEnum: {
        1: { text: "Hoạt động", status: "Success" },
        0: { text: "Không hoạt động", status: "Error" },
      },
      render(dom, entity, index, action, schema) {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {entity.bookStatus === 1 ? (
              <>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span>Hoạt động</span>
              </>
            ) : (
              <>
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                <span>Không hoạt động</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "Hành động",
      hideInSearch: true,
      render: (_, entity) => (
        <>
          <EditOutlined
            style={{ cursor: "pointer", marginRight: 15, color: "#f57800" }}
            onClick={async () => {
              const res = await getCategoryAPI();
              if (res && res.data) {
                setCategoryData(res.data.categories);
              }
              setOpenModalUpdate(true);
              setDataUpdate(entity);
            }}
          />
          <Popconfirm
            placement="leftTop"
            title={"Xác nhận xóa sách"}
            description={"Bạn có chắc chắn muốn xóa quyền sách này ?"}
            onConfirm={() => handleDeleteBook(entity.bookID)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ loading: isDeleteBook }}
          >
            <span style={{ cursor: "pointer", marginLeft: 20 }}>
              <DeleteTwoTone
                twoToneColor="#ff4d4f"
                style={{ cursor: "pointer" }}
              />
            </span>
          </Popconfirm>
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
          let query = "";
          if (params) {
            query += `current=${params.current}&pageSize=${params.pageSize}`;
            if (params.bookTitle) {
              query += `&bookTitle=${params.bookTitle}`;
            }
            if (params.author) {
              query += `&author=${params.author}`;
            }
            if (params.translator) {
              query += `&translator=${params.translator}`;
            }
            if (params.bookStatus) {
              query += `&bookStatus=${params.bookStatus}`;
            }
          }

          // Xử lý sort Price và Quantity
          if (sort.bookPrice) {
            query += `&sort=${
              sort.bookPrice === "ascend" ? "bookPrice" : "-bookPrice"
            }`;
          }
          if (sort.bookQuantity) {
            query += `&sort=${
              sort.bookQuantity === "ascend" ? "bookQuantity" : "-bookQuantity"
            }`;
          }

          const res = await getBookAPI(query);
          if (res.data) {
            setMeta(res.data.meta);
          }
          return {
            data: res.data?.result,
            page: 1,
            success: true,
            total: res.data?.meta.total,
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
            <div>
              {range[0]} - {range[1]} trên {total} rows
            </div>
          ),
        }}
        headerTitle="Book List"
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={async () => {
              setOpenModalCreate(true);
              const res = await getCategoryAPI();
              if (res && res.data) {
                setCategoryData(res.data.categories);
              }
            }}
            type="primary"
          >
            Add new
          </Button>,
        ]}
      />

      <DetailBook
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />

      <CreateBook
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        refreshTable={refreshTable}
        categoryData={categoryData}
        setCategoryData={setCategoryData}
      />

      <EditBook
        openModalUpdate={openModalUpdate}
        setOpenModalUpdate={setOpenModalUpdate}
        dataUpdate={dataUpdate}
        setDataUpdate={setDataUpdate}
        refreshTable={refreshTable}
        categoryData={categoryData}
      />
    </>
  );
};

export default TableBook;
