/* eslint-disable @typescript-eslint/no-explicit-any */
import OrderDetail from "@/components/client/order";
import Payment from "@/components/client/order/payment";
import { Breadcrumb, Button, Result, Steps } from "antd";
import { useState, useEffect, SetStateAction } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCurrentApp } from "@/components/context/app.context";
import { CreateOrderAPI, deleteBookFromCartAPI } from "@/services/api";

const OrderPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [orderData, setOrderData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { setCarts, user } = useCurrentApp();

  useEffect(() => {
    // Check if this is a return from VNPay payment gateway
    const queryParams = new URLSearchParams(location.search);
    const vnp_ResponseCode = queryParams.get("vnp_ResponseCode");
    const status = queryParams.get("status");
    const orderId = queryParams.get("orderId");

    // Handle VNPay direct callback
    if (vnp_ResponseCode) {
      // VNPay returns "00" for successful payments
      if (vnp_ResponseCode === "00") {
        handleSuccessfulPayment();
      } else {
        setPaymentStatus("failed");
      }
    }
    // Handle redirect from backend with status parameter
    else if (status === "success" && orderId) {
      handleSuccessfulPayment();
    }
  }, [location]);

  // Function to handle successful payment
  const handleSuccessfulPayment = async () => {
    try {
      // Get pending order from localStorage
      const pendingOrderString = localStorage.getItem("pendingOrder");

      if (pendingOrderString) {
        const { orderData, isBuyNow } = JSON.parse(pendingOrderString);

        // Create order in database
        const res = await CreateOrderAPI(orderData);

        if (res && res.statusCode === 200) {
          // Remove items from cart in database
          if (user && !isBuyNow) {
            const deletePromises = orderData.details.map(
              (item: { bookId: number }) =>
                deleteBookFromCartAPI(user.username, item.bookId)
            );
            await Promise.all(deletePromises);
          }

          // Clear local storage
          if (isBuyNow) {
            localStorage.removeItem("buy_now_item");
          } else {
            localStorage.removeItem("carts");
          }

          setCarts([]);
          localStorage.removeItem("pendingOrder");

          // Update UI
          setPaymentStatus("success");
          setCurrentStep(2);
        } else {
          setPaymentStatus("failed");
        }
      } else {
        // If no pending order found, still show success but log warning
        console.warn("No pending order found in localStorage");
        setPaymentStatus("success");
        setCurrentStep(2);
      }
    } catch (error) {
      console.error("Error processing successful payment:", error);
      setPaymentStatus("failed");
    }
  };

  // Function to handle VNPay payment
  const handleVNPayPayment = async (orderData: any) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/payment/create-payment",
        orderData
      );

      if (response.data && response.data.paymentUrl) {
        // Redirect to VNPay payment URL
        window.location.href = response.data.paymentUrl;
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      setPaymentStatus("failed");
    }
  };

  // Function to save order data from OrderDetail component
  const saveOrderData = (data: SetStateAction<null>) => {
    setOrderData(data);
  };

  return (
    <div style={{ background: "#efefef", padding: "20px 0" }}>
      <div
        className="order-container"
        style={{ maxWidth: 1440, margin: "0 auto" }}
      >
        <Breadcrumb
          separator=">"
          items={[
            {
              title: <Link to={"/"}>Trang Chủ</Link>,
            },

            {
              title: "Chi Tiết Giỏ Hàng",
            },
          ]}
        />
        <div className="order-steps" style={{ marginTop: 10 }}>
          <Steps
            size="small"
            current={currentStep}
            items={[
              {
                title: "Đơn hàng",
              },
              {
                title: "Đặt hàng",
              },
              {
                title: "Thanh toán",
              },
            ]}
          />
        </div>
        {currentStep === 0 && (
          <OrderDetail
            setCurrentStep={setCurrentStep}
            saveOrderData={saveOrderData}
          />
        )}

        {currentStep === 1 && (
          <Payment
            setCurrentStep={setCurrentStep}
            onVNPayPayment={handleVNPayPayment}
            orderData={orderData}
          />
        )}

        {currentStep === 2 && (
          <Result
            status="success"
            title="Đặt hàng thành công"
            subTitle="Hệ thống đã ghi nhận thông tin đơn hàng của bạn."
            extra={[
              <Button key="home">
                <Link to={"/"}>Trang Chủ</Link>
              </Button>,

              <Button key="history">
                <Link to={"/history"}>Lịch sử mua hàng</Link>
              </Button>,
            ]}
          />
        )}

        {paymentStatus === "failed" && (
          <Result
            status="error"
            title="Thanh toán thất bại"
            subTitle="Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại."
            extra={[
              <Button
                key="tryAgain"
                type="primary"
                onClick={() => setCurrentStep(1)}
              >
                Thử lại
              </Button>,
              <Button key="home">
                <Link to={"/"}>Trang Chủ</Link>
              </Button>,
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default OrderPage;
