import { deleteCategoryAPI, getCategoryPaginationAPI } from "@/services/api";
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
import { Button, message, notification, Popconfirm } from "antd";
import { useRef, useState } from "react";
import DetailCategory from "./detail.category";
import CreateCategory from "./create.category";
import EditCategory from "./update.category";
// import DetailCategory from './detail.category';
// import CreateCategory from './create.category';
// import EditCategory from './update.category';

type TSearch = {
  catName: string;
  catStatus: number;
};

const TableCategory = () => {
  const actionRef = useRef<ActionType>();
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 5,
    pages: 0,
    total: 0,
  });

  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<ICategory | null>(null);

  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);

  const [isDeleteCategory, setIsDeleteCategory] = useState<boolean>(false);

  const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
  const [dataUpdate, setDataUpdate] = useState<ICategory | null>(null);

  const handleDeleteCategory = async (catID: number) => {
    setIsDeleteCategory(true);
    const res = await deleteCategoryAPI(catID);
    if (res.statusCode === 200) {
      message.success("Xóa danh mục thành công!");
      // Giả sử meta.total hiện tại là tổng số bản ghi trước khi xóa.
      // Nếu sau khi xóa (meta.total - 1) ≤ (meta.current - 1) * meta.pageSize
      // nghĩa là trang hiện tại trở nên rỗng, thì giảm current xuống 1.
      if (
        meta.current > 1 &&
        meta.total - 1 <= (meta.current - 1) * meta.pageSize
      ) {
        setMeta((prev) => ({ ...prev, current: prev.current - 1 }));
      }
      actionRef.current?.reload();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsDeleteCategory(false);
  };

  const columns: ProColumns<ICategory>[] = [
    {
      title: "ID",
      dataIndex: "catID",
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Danh mục: ",
      dataIndex: "catName",
      sorter: true,
      render: (dom, entity) => (
        <a
          onClick={() => {
            setOpenViewDetail(true);
            setDataViewDetail(entity);
          }}
        >
          {entity.catName}
        </a>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "catDescription",
      hideInSearch: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "catStatus",
      valueType: "select",
      valueEnum: {
        1: { text: "Active", status: "Success" },
        0: { text: "Inactive", status: "Error" },
      },
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {record.catStatus === 1 ? (
            <>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              <span>Active</span>
            </>
          ) : (
            <>
              <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              <span>Inactive</span>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Hành động",
      hideInSearch: true,
      render: (_, entity) => (
        <>
          <EditOutlined
            style={{ cursor: "pointer", marginRight: 15, color: "#f57800" }}
            onClick={() => {
              setOpenModalUpdate(true);
              setDataUpdate(entity);
            }}
          />
          <Popconfirm
            placement="leftTop"
            title="Xác nhận xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            onConfirm={() => handleDeleteCategory(entity.catID)}
            okText="Xác nhận"
            cancelText="Hủy"
            okButtonProps={{ loading: isDeleteCategory }}
          >
            <DeleteTwoTone
              twoToneColor="#ff4d4f"
              style={{ cursor: "pointer" }}
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <ProTable<ICategory, TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort) => {
          let query = `current=${params.current}&pageSize=${params.pageSize}`;
          if (params.catName) {
            query += `&catName=${params.catName}`;
          }
          if (params.catStatus !== undefined) {
            query += `&catStatus=${params.catStatus}`;
          }
          // Xử lý sort theo catID và catName
          if (sort && Object.keys(sort).length > 0) {
            if (sort.catID) {
              query += `&sort=${sort.catID === "ascend" ? "catID" : "-catID"}`;
            } else if (sort.catName) {
              query += `&sort=${
                sort.catName === "ascend" ? "catName" : "-catName"
              }`;
            }
          }
          const res = await getCategoryPaginationAPI(query);
          if (res && res.data && res.data.meta) {
            setMeta(res.data.meta);
          }
          return {
            data: res.data?.result,
            success: true,
            total: res.data?.meta.total,
          };
        }}
        rowKey="catID"
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
        headerTitle="Danh sách danh mục"
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

      <DetailCategory
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
      />

      <CreateCategory
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        reloadTable={() => actionRef.current?.reload()}
      />

      <EditCategory
        openModalUpdate={openModalUpdate}
        setOpenModalUpdate={setOpenModalUpdate}
        dataUpdate={dataUpdate}
        reloadTable={() => actionRef.current?.reload()}
      />
    </>
  );
};

export default TableCategory;
