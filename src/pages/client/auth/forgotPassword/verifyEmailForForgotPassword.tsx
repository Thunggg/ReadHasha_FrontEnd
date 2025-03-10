import React, { useState, useEffect, useContext } from "react";
import { Button, Form, Input, message, notification, theme } from "antd";
import { MailOutlined, ReloadOutlined } from "@ant-design/icons";
import { resendOTP, verifyEmail } from "@/services/api";
import { useNavigate } from "react-router-dom";
import "./verifyEmail.scss";

type VerifyEmailForm = {
    otp: string;
};

const VerifyEmailForgotPassword: React.FC = () => {
    const { token } = theme.useToken();
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const navigate = useNavigate();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const onFinish = async (values: VerifyEmailForm) => {
        setLoading(true);
        try {
            const res = await verifyEmail(values.otp);
            console.log(res)
            if (res?.statusCode === 200) {
                message.success("Xác thực thành công!");
                navigate("/forgot-password/reset-password");
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message
                })
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onResendOTP = async () => {
        setResendLoading(true);
        try {
            const res = await resendOTP();
            if (res?.statusCode === 200) {
                message.success("Đã gửi lại mã OTP!");
                setCountdown(60);
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message
                })
            }
        } catch (error) {
            console.error(error);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div
            className="verify-container"
            style={{
                background: "linear-gradient(150deg, #f8f9fa 0%, #e9ecef 100%)",
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <div
                className="auth-card"
                style={{
                    background: token.colorBgContainer,
                    borderRadius: "20px",
                    padding: "48px 40px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    maxWidth: "500px",
                    width: "100%",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    className="decorative-line"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "4px",
                        background: token.colorPrimary,
                    }}
                />

                <MailOutlined
                    style={{
                        fontSize: "56px",
                        color: token.colorPrimary,
                        marginBottom: "32px",
                        display: "inline-block",
                        padding: "16px",
                        borderRadius: "50%",
                        background: token.colorPrimaryBg,
                    }}
                />

                <h1
                    style={{
                        fontSize: "28px",
                        fontWeight: 700,
                        marginBottom: "12px",
                        color: token.colorTextHeading,
                        letterSpacing: "-0.5px",
                    }}
                >
                    Xác Minh Email
                </h1>

                <p
                    style={{
                        color: token.colorTextSecondary,
                        marginBottom: "40px",
                        fontSize: "16px",
                        lineHeight: 1.6,
                    }}
                >
                    Vui lòng nhập mã xác thực 6 chữ số
                    <br />
                    đã được gửi đến email của bạn
                </p>

                <Form name="verify-email" onFinish={onFinish} autoComplete="off" layout="vertical">
                    <Form.Item
                        name="otp"
                        rules={[
                            { required: true, message: "Vui lòng nhập mã OTP!" },
                            { pattern: /^\d{6}$/, message: "Mã OTP phải là 6 chữ số!" }
                        ]}
                    >
                        <Input.OTP
                            length={6}
                            size="large"
                            className="elegant-otp-input"
                            autoFocus
                            {...({
                                inputRender: (node: any, props: any) => (
                                    <input
                                        {...props}
                                        type="tel"
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        onKeyDown={(e) => {
                                            if (
                                                !/^[0-9]$/.test(e.key) &&
                                                e.key !== "Backspace" &&
                                                e.key !== "Delete" &&
                                                e.key !== "ArrowLeft" &&
                                                e.key !== "ArrowRight"
                                            ) {
                                                e.preventDefault();
                                            }
                                        }}
                                        style={{ textAlign: "center" }}
                                    />
                                ),
                            } as any)}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: "40px" }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            style={{
                                height: "52px",
                                fontWeight: 600,
                                fontSize: "16px",
                                borderRadius: "12px",
                                transition: "all 0.3s",
                                boxShadow: "0 4px 6px rgba(22, 119, 255, 0.2)",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 12px rgba(22, 119, 255, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 6px rgba(22, 119, 255, 0.2)";
                            }}
                        >
                            Xác Nhận
                        </Button>
                    </Form.Item>

                    <div
                        style={{
                            marginTop: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        {countdown > 0 ? (
                            <>
                                <span
                                    style={{
                                        color: token.colorTextDescription,
                                        fontSize: "14px",
                                    }}
                                >
                                    Chưa nhận được mã?
                                </span>
                                <span
                                    style={{
                                        color: token.colorPrimary,
                                        fontWeight: 500,
                                    }}
                                >
                                    {countdown}s
                                </span>
                            </>
                        ) : (
                            <Button
                                type="link"
                                icon={<ReloadOutlined style={{ fontSize: "16px" }} />}
                                onClick={onResendOTP}
                                loading={resendLoading}
                                style={{
                                    color: token.colorPrimary,
                                    fontWeight: 600,
                                    padding: "0 12px",
                                }}
                            >
                                Gửi Lại Mã
                            </Button>
                        )}
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default VerifyEmailForgotPassword;
