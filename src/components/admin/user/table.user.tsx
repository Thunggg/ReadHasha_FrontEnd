// import { getUserAPI } from '@/services/api';
import { deleteUserAPI, getUserAPI, updateUserAPI } from "@/services/api";
import { dateRangeValidate } from "@/services/helper";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DeleteTwoTone,
  EditTwoTone,
  PlusOutlined,
  SyncOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { Button, message, notification, Popconfirm } from "antd";
import { useRef, useState } from "react";
import DetailUser from "./detail.user";
import CreateUser from "./create.user";
import UpdateUser from "./update.user";
import dayjs from "dayjs";

type TSearch = {
  userName: string;
  email: string;
  createdAt: string;
  createdAtRange: string;
  accStatus: number;
};

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

  const [isReactivatingUser, setIsReactivatingUser] = useState<boolean>(false);

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  const handleDeleteUser = async (userName: string) => {
    setIsDeleteUser(true);
    const res = await deleteUserAPI(userName);
    if (res.statusCode == 200) {
      message.success("Xóa user thành công");
      refreshTable();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsDeleteUser(false);
  };

  const handleReactivateUser = async (username: string, email: string) => {
    setIsReactivatingUser(true);
    const payload = {
      username,
      email,
      accStatus: 1 // Set status to active
    };
    const res = await updateUserAPI(payload);
    if (res.statusCode == 200) {
      message.success("Kích hoạt lại tài khoản thành công");
      refreshTable();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsReactivatingUser(false);
  };

  const handleEditUser = (entity: IUser) => {
    setDataUpdate(entity);
    setOpenModalUpdate(true);
  };

  const columns: ProColumns<IUser>[] = [
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48,
    },
    {
      title: "Tên đăng nhập",
      dataIndex: "userName",
      render(dom, entity, index, action, schema) {
        return (
          <>
            <a
              onClick={() => {
                setOpenViewDetail(true);
                setDataViewDetail(entity);
              }}
            >
              {entity.username}
            </a>
          </>
        );
      },
    },
    {
      title: "Họ vào tên",
      dataIndex: "fullName",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
        return (
          <>
            <div>
              {entity.firstName} {entity.lastName}
            </div>
          </>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      copyable: true,
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      valueType: "date",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "Ngày sinh",
      dataIndex: "createdAtRange",
      valueType: "dateRange",
      hideInTable: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "accStatus",
      valueType: "select",
      valueEnum: {
        1: { text: "Hoạt động", status: "1" },
        0: { text: "Ngừng hoạt động", status: "0" },
        2: { text: "Chờ xác thực", status: "2" },
      },
      render(dom, entity, index, action, schema) {
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {entity.accStatus === 1 ? (
              <>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span>Hoạt động</span>
              </>
            ) : entity.accStatus === 0 ? (
              <>
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                <span>Ngừng hoạt động</span>
              </>
            ) : (
              <>
                <ClockCircleOutlined style={{ color: "#faad14" }} />
                <span>Chờ xác thực</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "Hành động",
      hideInSearch: true,
      render(dom, entity, index, action, schema) {
        return (
          <>
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", marginRight: 15 }}
              onClick={() => {
                if (entity.role === 0) {
                  message.error("Không thể chỉnh sửa tài khoản Admin");
                  return;
                }
                handleEditUser(entity);
              }}
            />
            {entity.role !== 0 && (
              <>
                {entity.accStatus === 0 ? (
                  <Popconfirm
                    placement="leftTop"
                    title={"Kích hoạt lại tài khoản"}
                    description={"Bạn có chắc chắn muốn kích hoạt lại tài khoản này ?"}
                    onConfirm={() => handleReactivateUser(entity.username, entity.email)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                    okButtonProps={{ loading: isReactivatingUser }}
                  >
                    <span style={{ cursor: "pointer", marginLeft: 20 }}>
                      <UndoOutlined
                        style={{ color: "#52c41a", cursor: "pointer" }}
                      />
                    </span>
                  </Popconfirm>
                ) : (
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
                )}
              </>
            )}
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
            query += `current=${params.current}&pageSize=${params.pageSize}`;
            if (params.email) {
              query += `&email=${params.email}`;
            }
            if (params.userName) {
              query += `&userName=${params.userName}`;
            }
            if (params.accStatus) {
              query += `&accStatus=${params.accStatus}`;
              console.log(params.accStatus)
            }

            const createDateRange = dateRangeValidate(params.createdAtRange);
            if (createDateRange) {
              const formattedStart = dayjs(createDateRange[0]).format(
                "YYYY-MM-DD"
              );
              const formattedEnd = dayjs(createDateRange[1]).format(
                "YYYY-MM-DD"
              );
              query += `&startDob=${formattedStart}&endDob=${formattedEnd}`;
            }
          }
          if (sort && sort.dob) {
            query += `&sort=${sort.dob === "ascend" ? "dob" : "-dob"}`;
          } else query += `&sort=-dob`;

          const res = await getUserAPI(query);
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
        rowKey="userName"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20, 50, 100],
          total: meta.total,
          showTotal: (total, range) => {
            return (
              <div>
                {range[0]} - {range[1]} trên {total} rows
              </div>
            );
          },
        }}
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
          </Button>,
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

export default TableUser;
