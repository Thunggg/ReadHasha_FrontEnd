import { useEffect, useState } from 'react';
import { App, Button, DatePicker, Divider, Form, Input, message, Modal, notification, Radio } from 'antd';
import type { FormProps } from 'antd';
import { updateUserAPI } from '@/services/api';
import './update.user.scss'
import { CalendarOutlined, CheckCircleFilled, ExclamationCircleFilled, MailOutlined, ManOutlined, PhoneOutlined, SolutionOutlined, StopFilled, UserOutlined, WomanOutlined } from '@ant-design/icons';
import { toDate, validateDate } from '@/services/helper';
import moment from 'moment';

interface IProps {
    openModalUpdate: boolean;
    setOpenModalUpdate: (v: boolean) => void;
    refreshTable: () => void;
    setDataUpdate: (v: IUser | null) => void;
    dataUpdate: IUser | null;
}

type FieldType = {
    firstName: string;
    lastName: string;
    dob: Date;
    email: string;
    phone: string;
    address: string;
    sex: string;
    accStatus: string;
    username: string;
};

const UpdateUser = (props: IProps) => {
    const { openModalUpdate, setOpenModalUpdate, refreshTable,
        setDataUpdate, dataUpdate
    } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const [usernameUser, setUsernameUser] = useState<string>("");

    // https://ant.design/components/form#components-form-demo-control-hooks
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataUpdate) {
            setUsernameUser(dataUpdate.username)
            form.setFieldsValue({
                firstName: dataUpdate.firstName,
                lastName: dataUpdate.lastName,
                dob: moment(dataUpdate.dob),
                email: dataUpdate.email,
                phone: dataUpdate.phone,
                address: dataUpdate.address,
                sex: dataUpdate.sex.toString(),
                accStatus: dataUpdate.accStatus === 1 ? 'active'
                    : dataUpdate.accStatus === 2 ? 'pending'
                        : 'inactive' // 0 và các trường hợp còn lại
            })
        }
    }, [dataUpdate])

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        console.log(values);
        console.log(usernameUser)
        setIsSubmit(true);

        const payload = {
            ...values,
            username: usernameUser,
            email: values.email,
            dob: toDate(values.dob), // Chuyển moment sang Date
            accStatus: values.accStatus === 'active' ? 1
                : values.accStatus === 'pending' ? 2
                    : 0, // Giả sử 0 là inactive
            sex: parseInt(values.sex) // Chuyển string sang number
        };

        const res = await updateUserAPI(payload);
        console.log(res);

        if (res && res.data) {
            message.success('Cập nhật thông tin thành công');
            form.resetFields();
            setOpenModalUpdate(false);
            setDataUpdate(null);
            refreshTable();
        } else {
            notification.error({
                message: 'Lỗi cập nhật',
                description: res.message || 'Không thể cập nhật thông tin'
            });
        }

        setIsSubmit(false);
        setUsernameUser("");
        refreshTable();
    };

    return (
        <>

            <Modal
                title={<span className="modal-title">CẬP NHẬT THÔNG TIN NGƯỜI DÙNG</span>}
                open={openModalUpdate}
                onOk={() => form.submit()}
                onCancel={() => {
                    setOpenModalUpdate(false);
                    setDataUpdate(null);
                    form.resetFields();
                }}
                okText="Lưu thay đổi"
                cancelText="Hủy bỏ"
                confirmLoading={isSubmit}
                width={800}
                className="user-update-modal"
                footer={[
                    <Button
                        key="back"
                        onClick={() => {
                            setOpenModalUpdate(false);
                            setDataUpdate(null);
                            form.resetFields();
                        }}
                        className="cancel-btn"
                    >
                        Hủy bỏ
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={isSubmit}
                        onClick={() => form.submit()}
                        className="submit-btn"
                    >
                        {isSubmit ? 'Đang xử lý...' : 'Lưu thay đổi'}
                    </Button>
                ]}
            >
                <div className="modal-content-wrapper">
                    <Form
                        form={form}
                        name="form-update"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                        requiredMark="optional"
                        className="custom-form"
                    >
                        <div className="form-columns">
                            {/* Cột trái */}
                            <div className="form-left">
                                <Form.Item<FieldType>
                                    label="Email"
                                    name="email"
                                    rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}
                                    className="form-item-email"
                                >
                                    <Input
                                        disabled
                                        suffix={<MailOutlined />}
                                        className="custom-input"
                                    />
                                </Form.Item>

                                <Form.Item<FieldType>
                                    label="Họ"
                                    name="firstName"
                                    rules={[{
                                        required: true,
                                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                        message: 'Chỉ chấp nhận ký tự chữ'
                                    }]}
                                >
                                    <Input
                                        placeholder="Nhập họ của bạn"
                                        suffix={<UserOutlined />}
                                        className="custom-input"
                                    />
                                </Form.Item>

                                <Form.Item<FieldType>
                                    label="Tên"
                                    name="lastName"
                                    rules={[{
                                        required: true,
                                        pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                        message: 'Chỉ chấp nhận ký tự chữ'
                                    }]}
                                >
                                    <Input
                                        placeholder="Nhập tên của bạn"
                                        suffix={<SolutionOutlined />}
                                        className="custom-input"
                                    />
                                </Form.Item>

                                <Form.Item<FieldType>
                                    label="Số điện thoại"
                                    name="phone"
                                    rules={[{
                                        required: true,
                                        pattern: /^[0-9]{10,15}$/,
                                        message: 'Số điện thoại không hợp lệ'
                                    }]}
                                >
                                    <Input
                                        placeholder="Nhập số điện thoại"
                                        suffix={<PhoneOutlined />}
                                        className="custom-input"
                                    />
                                </Form.Item>
                            </div>

                            {/* Cột phải */}
                            <div className="form-right">
                                <Form.Item<FieldType>
                                    label="Ngày sinh"
                                    name="dob"
                                    rules={[
                                        {
                                            validator: (_, value) => validateDate(value)
                                        }
                                    ]}
                                >
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        className="custom-datepicker"
                                        suffixIcon={<CalendarOutlined />}
                                        disabledDate={current =>
                                            current > moment().endOf('day') ||
                                            current < moment('1900-01-01')
                                        }
                                    />
                                </Form.Item>

                                <Form.Item<FieldType>
                                    label="Giới tính"
                                    name="sex"
                                    rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                                >
                                    <Radio.Group className="gender-radio-group">
                                        <Radio.Button value="0" className="female-option">
                                            <WomanOutlined /> Nữ
                                        </Radio.Button>
                                        <Radio.Button value="1" className="male-option">
                                            <ManOutlined /> Nam
                                        </Radio.Button>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item<FieldType>
                                    name="accStatus"
                                    label="Trạng thái tài khoản"
                                    rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                                >
                                    <Radio.Group className="compact-status-group">
                                        <Radio.Button value="active" className="status-card status-active">
                                            <div className="status-content-wrapper">
                                                <CheckCircleFilled className="status-icon" />
                                                <span className="status-title">Hoạt động</span>
                                            </div>
                                        </Radio.Button>
                                        <Radio.Button value="pending" className="status-card status-pending">
                                            <div className="status-content-wrapper">
                                                <ExclamationCircleFilled className="status-icon" />
                                                <span className="status-title">Chờ xử lý</span>
                                            </div>
                                        </Radio.Button>
                                        <Radio.Button value="inactive" className="status-card status-inactive">
                                            <div className="status-content-wrapper">
                                                <StopFilled className="status-icon" />
                                                <span className="status-title">Ngừng HĐ</span>
                                            </div>
                                        </Radio.Button>
                                    </Radio.Group>
                                </Form.Item>

                                <Form.Item<FieldType>
                                    label="Địa chỉ"
                                    name="address"
                                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                                >
                                    <Input.TextArea
                                        rows={3}
                                        placeholder="Nhập địa chỉ đầy đủ"
                                        className="custom-textarea"
                                        showCount
                                        maxLength={200}
                                    />
                                </Form.Item>
                            </div>
                        </div>
                    </Form>
                </div>
            </Modal>
        </>
    );
};

export default UpdateUser;