import { registerAPI } from "@/services/api";
import { Col, Form, Input, message, Modal, Radio, Row } from "antd";
import { FormProps } from "antd/lib";
import { useState } from "react";

type RegisterFormType = {
  username: string;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  phone: string;
  address: string;
  sex: string;
  password: string;
  confirmPassword: string;
};

interface IProps {
  openModalCreate: boolean;
  setOpenModalCreate: (v: boolean) => void;
  refreshTable: () => void;
}

const CreateUser = (props: IProps) => {
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const { openModalCreate, setOpenModalCreate, refreshTable } = props;

  const onFinish: FormProps<RegisterFormType>["onFinish"] = async (values) => {
    setIsSubmit(true);
    try {
      const registerData = {
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
        email: values.email,
        phone: values.phone,
        address: values.address,
        sex: values.sex,
        password: values.password,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("register", JSON.stringify(registerData));

      try {
        const res = await registerAPI(registerData);
        if (res.data && res.statusCode === 201) {
          message.success("Tạo mới User thành công");
          form.resetFields();
          setOpenModalCreate(false);
          refreshTable();
        } else {
          message.error(res.error);
          console.log(res);
        }
      } catch (error: any) {
        message.error(
          "Lỗi hệ thống: " + error.response?.data?.message || error.message
        );
      }
    } catch (error: any) {
      message.error("Failed to add account!");
    }
    setIsSubmit(false);
  };

  return (
    <>
      <Modal
        open={openModalCreate}
        onOk={() => {
          form.submit();
          refreshTable();
        }}
        onCancel={() => {
          form.resetFields();
          setOpenModalCreate(false);
        }}
        destroyOnClose={true}
        okButtonProps={{ loading: isSubmit }}
        okText={"Tạo mới"}
        cancelText={"Hủy"}
        confirmLoading={isSubmit}
        width={"50vw"}
        maskClosable={false}
      >
        <div className="container">
          <div className="register-form">
            {/* <img src='/logo-capybook.png' alt='Capybook Logo' className='register-logo' /> */}
            <h2>Thêm Mới Tài Khoản</h2>
            <Form
              form={form}
              name="register"
              labelCol={{ span: 24 }}
              style={{ maxWidth: 600 }}
              initialValues={{ sex: "0" }}
              onFinish={onFinish}
              autoComplete="off"
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Tên người dùng"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Tên người dùng phải chứa chữ cái và số!",
                        pattern: /^[a-zA-Z0-9]+$/,
                      },
                    ]}
                  >
                    <Input placeholder="Tên người dùng" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        type: "email",
                        message: "Vui lòng nhập email hợp lệ",
                      },
                    ]}
                  >
                    <Input placeholder="Email" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Mật khẩu"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message:
                          "Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ cái in hoa, thường, số, ký tự đặc biệt và không có khoảng trắng!",
                        pattern:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      },
                    ]}
                  >
                    <Input.Password placeholder="Mật khẩu" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                        message:
                          "Mật khẩu phải dài ít nhất 8 ký tự, bao gồm chữ cái in hoa, thường, số, ký tự đặc biệt và không có khoảng trắng!",
                        pattern:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                      },
                      {
                        validator: (_, value) => {
                          if (
                            !value ||
                            value === form.getFieldValue("password")
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              "Mật khẩu xác nhận không khớp với mật khẩu!"
                            )
                          );
                        },
                      },
                    ]}
                  >
                    <Input.Password placeholder="Xác nhận mật khẩu" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Tên"
                    name="firstName"
                    rules={[
                      {
                        required: true,
                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                        message: "Tên phải chứa chữ cái",
                      },
                    ]}
                  >
                    <Input placeholder="Tên" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Họ"
                    name="lastName"
                    rules={[
                      {
                        required: true,
                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                        message: "Họ phải chứa chữ cái",
                      },
                    ]}
                  >
                    <Input placeholder="Họ" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        required: true,
                        pattern: /^[0-9]{10,15}$/,
                        message: "Số điện thoại phải có từ 10 đến 15 chữ số!",
                      },
                    ]}
                  >
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item<RegisterFormType>
                    label="Ngày sinh"
                    name="dob"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập ngày sinh",
                      },
                      {
                        validator: (_, value) => {
                          if (!value) {
                            return Promise.reject(
                              new Error("Vui lòng nhập ngày sinh")
                            );
                          }
                          const selectedDate = new Date(value);
                          const currentDate = new Date();
                          const minDate = new Date("1900-01-01");

                          if (selectedDate > currentDate) {
                            return Promise.reject(
                              new Error("Ngày không thể là trong tương lai")
                            );
                          }

                          if (selectedDate < minDate) {
                            return Promise.reject(
                              new Error("Ngày không thể trước 1900-01-01")
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input type="date" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<RegisterFormType>
                    label="Giới tính"
                    name="sex"
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính" },
                    ]}
                  >
                    <Radio.Group>
                      <Radio value="0">Nữ</Radio>
                      <Radio value="1">Nam</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item<RegisterFormType>
                    label="Địa chỉ"
                    name="address"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ" },
                    ]}
                  >
                    <Input.TextArea rows={4} placeholder="Địa chỉ" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreateUser;
