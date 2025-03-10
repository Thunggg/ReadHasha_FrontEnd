import { ForgotPasswordContext } from "@/components/context/ForgotPassword.context";
import { checkEmailExists, sendVerificationOTP } from "@/services/api";
import { MailOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, notification, theme } from "antd";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Giả sử bạn đã triển khai các API checkEmailExists và sendVerificationOTP ở phía backend
// import { checkEmailExists, sendVerificationOTP } from "@/services/api";

const EmailVerificationPage = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const { setHasVisitedForgotPassword } = useContext(ForgotPasswordContext);

    useEffect(() => {
        // Đánh dấu rằng người dùng đã truy cập trang /forgot-password
        setHasVisitedForgotPassword(true);
    }, [setHasVisitedForgotPassword]);

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            // Kiểm tra xem email có tồn tại trong hệ thống hay không
            const res = await checkEmailExists(values.email);
            if (res.statusCode === 200) {
                // Nếu tồn tại, gửi mã OTP cho email
                const otpRes = await sendVerificationOTP(values.email);
                if (otpRes.statusCode === 200) {
                    localStorage.setItem("access_token", otpRes.access_token ?? "");
                    message.success("Mã OTP đã được gửi tới email của bạn");
                    // Chuyển hướng sang trang nhập OTP cùng với thông tin email
                    navigate("/forgot-password/verifyEmail", { state: { email: values.email } });
                } else {
                    message.error("Gửi OTP thất bại, vui lòng thử lại sau");
                }
            } else {
                notification.error({
                    message: 'Đã có lỗi xảy ra',
                    description: res.message
                })
            }
        } catch (error) {
            message.error("Đã có lỗi xảy ra, vui lòng thử lại sau!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                padding: "20px",
            }}
        >
            <Card
                title={
                    <div style={{
                        textAlign: "center",
                        fontSize: "1.8rem",
                        fontWeight: "600",
                        color: token.colorPrimary,
                        padding: "16px 0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px"
                    }}>
                        <MailOutlined style={{ fontSize: "32px" }} />
                        <span>Xác Thực Email</span>
                    </div>
                }
                style={{
                    width: "100%",
                    maxWidth: "480px",
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    overflow: "hidden",
                }}
                headStyle={{ borderBottom: "none" }}
                bodyStyle={{ padding: "24px" }}
            >
                <div style={{
                    textAlign: "center",
                    marginBottom: "32px",
                    fontSize: "16px",
                    color: token.colorTextSecondary,
                    lineHeight: 1.6
                }}>
                    <p>Vui lòng nhập địa chỉ Gmail của bạn</p>
                    <p>Chúng tôi sẽ kiểm tra và gửi mã xác thực đến email của bạn</p>
                </div>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label={<span style={{ fontWeight: 500 }}>Địa chỉ Email</span>}
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input
                            placeholder="example@gmail.com"
                            size="large"
                            prefix={<MailOutlined style={{ color: token.colorTextSecondary }} />}
                            style={{
                                borderRadius: "8px",
                                padding: "12px 16px",
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: "32px" }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            size="large"
                            style={{
                                height: "48px",
                                borderRadius: "8px",
                                fontWeight: 600,
                                background: token.colorPrimary,
                                border: "none",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                        >
                            Tiếp Tục
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EmailVerificationPage;