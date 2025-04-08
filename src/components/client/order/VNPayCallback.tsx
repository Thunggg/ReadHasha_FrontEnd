/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result, Button, Spin, notification } from "antd";
import {
  CreateOrderAPI,
  deleteBookFromCartAPI,
  processVNPayCallback,
  getBooksByIdAPI,
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

          // Kiểm tra số lượng sách trong kho trước khi hoàn tất đơn hàng
          const stockValidationErrors = [];

          for (const item of orderData.details) {
            // Lấy thông tin sách hiện tại để kiểm tra số lượng trong kho
            const bookResponse = await getBooksByIdAPI(item.bookId.toString());

            if (bookResponse && bookResponse.data) {
              const book = bookResponse.data;

              // Kiểm tra nếu số lượng trong đơn hàng vượt quá số lượng tồn kho
              if (item.quantity > book.bookQuantity) {
                stockValidationErrors.push({
                  bookTitle: book.bookTitle,
                  requested: item.quantity,
                  available: book.bookQuantity
                });
              }
            }
          }

          // Nếu có lỗi về số lượng tồn kho, hiển thị thông báo lỗi
          if (stockValidationErrors.length > 0) {
            const errorMessages = stockValidationErrors.map(err =>
              `${err.bookTitle}: yêu cầu ${err.requested}, chỉ còn ${err.available} sản phẩm`
            );

            setStatus("error");
            setErrorMessage("Một số sản phẩm trong đơn hàng không còn đủ số lượng trong kho. Vui lòng cập nhật giỏ hàng và thử lại.");

            // Hiển thị chi tiết về các sản phẩm không đủ số lượng
            notification.error({
              message: "Không đủ hàng trong kho",
              description: (
                <div>
                  <p>Đơn hàng của bạn không thể hoàn tất vì một số sản phẩm đã hết hoặc không đủ số lượng:</p>
                  <ul>
                    {errorMessages.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                  <p>Vui lòng cập nhật giỏ hàng của bạn và thử lại.</p>
                </div>
              ),
              duration: 0, // Hiển thị cho đến khi người dùng đóng
            });

            return;
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
