/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import {
  CreateOrderAPI,
  deleteBookFromCartAPI,
  processVNPayCallback,
} from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";

const VNPayCallback = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { setCarts, user } = useCurrentApp();

  useEffect(() => {
    const processPaymentResult = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const responseCode = queryParams.get("vnp_ResponseCode");
        const orderInfo = queryParams.get("vnp_OrderInfo");
        const amount = queryParams.get("vnp_Amount");
        const transactionNo = queryParams.get("vnp_TransactionNo");

        console.log("VNPay callback params:", {
          responseCode,
          orderInfo,
          amount,
          transactionNo,
        });

        // Kiểm tra kết quả thanh toán từ VNPay
        if (responseCode === "00") {
          // Thanh toán thành công, xử lý đơn hàng
          const pendingOrderString = localStorage.getItem("pendingOrder");

          if (!pendingOrderString) {
            setStatus("error");
            setErrorMessage("Không tìm thấy thông tin đơn hàng");
            return;
          }

          const { orderData, isBuyNow } = JSON.parse(pendingOrderString);

          // Gọi API để xác nhận thanh toán thành công
          try {
            await processVNPayCallback(queryParams);
          } catch (error) {
            console.error("Error confirming payment with backend:", error);
            // Tiếp tục xử lý đơn hàng ngay cả khi không thể xác nhận với backend
          }

          // Gọi API tạo đơn hàng
          const res = await CreateOrderAPI(orderData);

          if (res && res.statusCode === 200) {
            // Xóa từng sản phẩm trong giỏ hàng từ database
            if (user && !isBuyNow) {
              const deletePromises = orderData.details.map((item: any) =>
                deleteBookFromCartAPI(user.username, item.bookId)
              );
              await Promise.all(deletePromises);
            }

            // Nếu là mua ngay, xóa giỏ hàng tạm thời
            if (isBuyNow) {
              localStorage.removeItem("buy_now_item");
            } else {
              localStorage.removeItem("carts");
            }

            setCarts([]);
            setStatus("success");

            // Xóa thông tin đơn hàng đang chờ
            localStorage.removeItem("pendingOrder");
          } else {
            throw new Error(res.message || "Có lỗi xảy ra khi xử lý đơn hàng");
          }
        } else {
          // Thanh toán thất bại
          setStatus("error");
          setErrorMessage(
            `Thanh toán không thành công. Mã lỗi: ${responseCode}`
          );
        }
      } catch (error: any) {
        console.error("Payment processing error:", error);
        setStatus("error");
        setErrorMessage(
          error.message || "Đã xảy ra lỗi trong quá trình xử lý thanh toán"
        );
      }
    };

    processPaymentResult();
  }, [location, navigate, setCarts, user]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang xử lý kết quả thanh toán..." />
      </div>
    );
  }

  if (status === "success") {
    return (
      <Result
        status="success"
        title="Thanh toán thành công!"
        subTitle="Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate("/")}>
            Trang chủ
          </Button>,
          <Button key="history" onClick={() => navigate("/history")}>
            Lịch sử mua hàng
          </Button>,
        ]}
      />
    );
  }

  return (
    <Result
      status="error"
      title="Thanh toán thất bại"
      subTitle={
        errorMessage ||
        "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại."
      }
      extra={[
        <Button type="primary" key="retry" onClick={() => navigate("/order")}>
          Thử lại
        </Button>,
        <Button key="home" onClick={() => navigate("/")}>
          Trang chủ
        </Button>,
      ]}
    />
  );
};

export default VNPayCallback;
