import { registerAPI } from '@/services/api';
import {
    App,
    Button,
    Col, Divider, Form, Image, Input,
    InputNumber, message, Modal, Radio, Row, Select, Upload
} from 'antd';
import { FormProps } from 'antd/lib';
import { useState } from 'react';

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

    const onFinish: FormProps<RegisterFormType>['onFinish'] = async (values) => {
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
            formDataToSend.append('register', JSON.stringify(registerData));

            try {
                const res = await registerAPI(registerData);
                if (res.data && res.statusCode === 201) {
                    message.success('Tạo mới User thành công');
                    form.resetFields();
                    setOpenModalCreate(false);
                    refreshTable();
                } else {
                    message.error(res.error);
                }
            } catch (error: any) {
                message.error("Lỗi hệ thống: " + error.response?.data?.message || error.message);
            }

        } catch (error: any) {
            message.error('Failed to add account!');
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
                <div className='container'>
                    <div className='register-form'>
                        {/* <img src='/logo-capybook.png' alt='Capybook Logo' className='register-logo' /> */}
                        <h2>Thêm Mới Tài Khoản</h2>
                        <Form
                            form={form}
                            name='register'
                            labelCol={{ span: 24 }}
                            style={{ maxWidth: 600 }}
                            initialValues={{ sex: '0' }}
                            onFinish={onFinish}
                            autoComplete='off'
                        >
                            <Row gutter={24}>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='Username'
                                        name='username'
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                message: 'Username must be contained letters and numbers!',
                                                pattern: /^[a-zA-Z0-9]+$/,
                                            }
                                        ]}
                                    >
                                        <Input placeholder='Username' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='Email'
                                        name='email'
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                type: 'email',
                                                message: 'Please enter a valid email'
                                            }
                                        ]}
                                    >
                                        <Input placeholder='Email' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='Password'
                                        name='password'
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                message: 'Password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces!',
                                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                                            }
                                        ]}
                                    >
                                        <Input.Password placeholder='Password' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='Confirm Password'
                                        name='confirmPassword'
                                        dependencies={['password']}
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                message: 'Password must be at least 8 characters long, include uppercase, lowercase, a number, a special character, and no spaces!',
                                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                                            },
                                            {
                                                validator: (_, value) => {
                                                    if (!value || value === form.getFieldValue('password')) {
                                                        return Promise.resolve()
                                                    }
                                                    return Promise.reject(
                                                        new Error('Confirm password does not match to password!')
                                                    )
                                                }
                                            }
                                        ]}
                                    >
                                        <Input.Password placeholder='Confirm Password' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='First Name'
                                        name='firstName'
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                                message: "First name must be contained letters"
                                            }
                                        ]}
                                    >
                                        <Input placeholder='First Name' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='Last Name'
                                        name='lastName'
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                pattern: /^\p{L}+(\s\p{L}+)*$/u,
                                                message: "Last name must be contained letters"
                                            }
                                        ]}
                                    >
                                        <Input placeholder='Last Name' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='Phone'
                                        name='phone'
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                pattern: /^[0-9]{10,15}$/,
                                                message: "Phone number must be 10-15 digits!"
                                            }
                                        ]}
                                    >
                                        <Input placeholder='Phone Number' />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item<RegisterFormType>
                                        label='Date of Birth'
                                        name='dob'
                                        rules=
                                        {[
                                            {
                                                required: true,
                                                message: 'Please enter date of birth'
                                            },
                                            {
                                                validator: (_, value) => {
                                                    if (!value) {
                                                        return Promise.reject(new Error("Please enter date of birth"))
                                                    }
                                                    const selectedDate = new Date(value)
                                                    const currentDate = new Date()
                                                    const minDate = new Date('1900-01-01')

                                                    if (selectedDate > currentDate) {
                                                        return Promise.reject(new Error("Date cannot be in the future"))
                                                    }

                                                    if (selectedDate < minDate) {
                                                        return Promise.reject(new Error("Date cannot be before 1900-01-01"))
                                                    }
                                                    return Promise.resolve()
                                                }
                                            }
                                        ]}
                                    >
                                        <Input type='date' />
                                    </Form.Item>
                                </Col>

                                <Col span={24}>
                                    <Form.Item<RegisterFormType>
                                        label='Sex'
                                        name='sex'
                                        rules={[{ required: true, message: 'Please select your gender' }]}
                                    >
                                        <Radio.Group>
                                            <Radio value='0'>Female</Radio>
                                            <Radio value='1'>Male</Radio>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item<RegisterFormType>
                                        label='Address'
                                        name='address'
                                        rules={[{ required: true, message: 'Please enter address' }]}
                                    >
                                        <Input.TextArea rows={4} placeholder='Address' />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default CreateUser;