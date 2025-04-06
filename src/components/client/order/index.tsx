/* eslint-disable @typescript-eslint/no-explicit-any */
// OrderDetail.tsx
import { App, Button, Col, Divider, Empty, InputNumber, Row } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useCurrentApp } from "@/components/context/app.context";
import "@/styles/order.scss";
import {
  deleteBookFromCartAPI,
  fetchAccountAPI,
  updateCartQuantityAPI,
} from "@/services/api";

interface IProps {
  setCurrentStep: (v: number) => void;
}

const OrderDetail = (props: IProps) => {
  const { setCurrentStep } = props;
  const { carts, setCarts } = useCurrentApp();
  const [totalPrice, setTotalPrice] = useState(0);
  const { message } = App.useApp();
  const { user } = useCurrentApp();

  useEffect(() => {
    const sum = carts.reduce(
      (acc, item) => acc + item.quantity * (item.detail?.bookPrice || 0),
      0
    );
    setTotalPrice(sum);
  }, [carts]);

  // const handleOnChangeInput = (value: number | null, book: IBook) => {
  //     if (!value || value < 1) return;
  //     const updatedCarts = carts.map(cart =>
  //         cart.id === book.bookID ? { ...cart, quantity: value } : cart
  //     );
  //     localStorage.setItem("carts", JSON.stringify(updatedCarts));
  //     setCarts(updatedCarts);
  // };

  const handleOnChangeInput = async (value: number, book: IBook) => {
    if (!user) {
      message.error("Bạn cần đăng nhập để thực hiện tính năng này.");
      return false;
    }

    if (value < 1) {
      message.error("Số lượng không hợp lệ!");
      return false;
    }

    if (value > book.bookQuantity) {
      message.error("Số lượng không được vượt quá số lượng tồn kho!");
      return false;
    }

    try {
      const response = await updateCartQuantityAPI(
        user.username,
        book.bookID,
        value
      );

      if (response.statusCode === 200) {
        // Cập nhật lại giỏ hàng từ database
        const accountRes = await fetchAccountAPI();

        if (accountRes.data?.cartCollection) {
          const cartsFromDB = accountRes.data.cartCollection.map((item) => ({
            id: item.bookID.bookID,
            quantity: item.quantity,
            detail: item.bookID,
          }));

          setCarts(cartsFromDB);
          localStorage.setItem("carts", JSON.stringify(cartsFromDB));
        }

        return true;
      } else {
        message.error(response.message || "Cập nhật số lượng thất bại!");
        return false;
      }
    } catch (error: any) {
      console.error("Error updating cart quantity:", error);
      message.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật số lượng!"
      );
      return false;
    }
  };

  const handleRemoveBook = async (id: number) => {
    if (!user) {
      message.error("Bạn cần đăng nhập để thực hiện tính năng này.");
      return false;
    }

    try {
      const response = await deleteBookFromCartAPI(user.username, id);

      if (response.statusCode === 200) {
        // Cập nhật lại giỏ hàng từ database
        const accountRes = await fetchAccountAPI();

        if (accountRes.data?.cartCollection) {
          const cartsFromDB = accountRes.data.cartCollection.map((item) => ({
            id: item.bookID.bookID,
            quantity: item.quantity,
            detail: item.bookID,
          }));

          setCarts(cartsFromDB);
          localStorage.setItem("carts", JSON.stringify(cartsFromDB));
        } else {
          setCarts([]);
          localStorage.setItem("carts", JSON.stringify([]));
        }

        message.success("Đã xóa sách khỏi giỏ hàng!");
        return true;
      } else {
        message.error(response.message || "Xóa sách khỏi giỏ hàng thất bại!");
        return false;
      }
    } catch (error: any) {
      console.error("Error removing book from cart:", error);
      message.error(
        error.response?.data?.message ||
          "Có lỗi xảy ra khi xóa sách khỏi giỏ hàng!"
      );
      return false;
    }
  };

  const handleNextStep = () => {
    if (!carts.length) {
      message.error("Không tồn tại sản phẩm trong giỏ hàng.");
      return;
    }
    setCurrentStep(1);
  };

  return (
    <div className="order-page-container">
      <div className="order-container">
        <Row gutter={[24, 24]}>
          <Col md={16} xs={24}>
            <div className="order-list">
              {carts.map((item, index) => (
                <div className="order-book" key={`book-${index}`}>
                  <div className="book-content">
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${
                        item.detail.image
                      }`}
                      // alt={item.detail.bookTitle}
                    />
                    <div className="book-info">
                      <div className="book-title">{item.detail.bookTitle}</div>
                      <div className="book-price">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.detail.bookPrice)}
                      </div>
                    </div>
                  </div>
                  <div className="action">
                    <InputNumber
                      min={1}
                      max={item.detail.bookQuantity}
                      value={item.quantity}
                      onChange={(value) =>
                        handleOnChangeInput(value || 0, item.detail)
                      }
                      className="quantity-input"
                    />
                    <DeleteOutlined
                      onClick={() => handleRemoveBook(item.id)}
                      className="delete-icon"
                    />
                  </div>
                  <div className="sum">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.detail.bookPrice * item.quantity)}
                  </div>
                </div>
              ))}
              {carts.length === 0 && (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="empty-cart-text">
                      Giỏ hàng của bạn đang trống
                    </span>
                  }
                />
              )}
            </div>
          </Col>

          <Col md={8} xs={24}>
            <div className="order-sum">
              <div className="summary-section">
                <div className="calculate">
                  <span>Tạm tính:</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </span>
                </div>
                <Divider className="custom-divider" />
                <div className="calculate">
                  <span>Tổng tiền:</span>
                  <span className="sum-final">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </span>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  className="checkout-btn"
                  onClick={handleNextStep}
                >
                  Thanh toán ({carts.length})
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default OrderDetail;
