/* eslint-disable @typescript-eslint/no-explicit-any */
// OrderDetail.tsx
import {
  App,
  Button,
  Col,
  Divider,
  Empty,
  InputNumber,
  Row,
  notification,
  Alert,
  Checkbox,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useCurrentApp } from "@/components/context/app.context";
import "@/styles/order.scss";
import {
  deleteBookFromCartAPI,
  fetchAccountAPI,
  updateCartQuantityAPI,
} from "@/services/api";
import { useNavigate } from "react-router-dom";

interface IProps {
  setCurrentStep: (v: number) => void;
}

const OrderDetail = (props: IProps) => {
  const { setCurrentStep } = props;
  const { carts, setCarts } = useCurrentApp();
  const [totalPrice, setTotalPrice] = useState(0);
  const { message } = App.useApp();
  const { user } = useCurrentApp();
  const [warnings, setWarnings] = useState<{
    locked: string[];
    outOfStock: string[];
  }>({ locked: [], outOfStock: [] });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const sum = carts.reduce(
      (acc, item) => {
        // Chỉ tính tổng tiền cho các sản phẩm đã chọn
        if (selectedItems.includes(item.id)) {
          return acc + item.quantity * (item.detail?.bookPrice || 0);
        }
        return acc;
      },
      0
    );
    setTotalPrice(sum);
  }, [carts, selectedItems]);

  // Kiểm tra trạng thái sách và cập nhật cảnh báo
  useEffect(() => {
    const lockedBooks: string[] = [];
    const outOfStockBooks: string[] = [];

    carts.forEach((item) => {
      if (item.detail.bookStatus === 0) {
        lockedBooks.push(item.detail.bookTitle as string);
      } else if (item.detail.bookQuantity === 0) {
        outOfStockBooks.push(item.detail.bookTitle as string);
      }
    });

    setWarnings({
      locked: lockedBooks,
      outOfStock: outOfStockBooks,
    });
  }, [carts]);

  // Reset selected items when cart changes
  useEffect(() => {
    setSelectedItems([]);
    setSelectAll(false);
  }, [carts.length]);

  const handleOnChangeInput = async (value: number, book: IBook) => {
    if (!user) {
      message.error("Bạn cần đăng nhập để thực hiện tính năng này.");
      return false;
    }

    if (value < 1) {
      message.error("Số lượng không hợp lệ!");
      return false;
    }

    if (book.bookStatus === 0) {
      message.error("Sách này đã bị khóa và không thể mua!");
      return false;
    }

    if (book.bookQuantity === 0) {
      message.error("Sách này đã hết hàng!");
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

  // Handle multiple items deletion
  const handleRemoveSelectedBooks = async () => {
    if (!user) {
      message.error("Bạn cần đăng nhập để thực hiện tính năng này.");
      return;
    }

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn ít nhất một sách để xóa.");
      return;
    }

    try {
      // Show loading message
      const loadingMessage = message.loading(
        "Đang xóa sách khỏi giỏ hàng...",
        0
      );

      // Delete each selected book
      const deletePromises = selectedItems.map((id) =>
        deleteBookFromCartAPI(user.username, id)
      );

      await Promise.all(deletePromises);

      // Update cart from database
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

      // Clear selected items
      setSelectedItems([]);
      setSelectAll(false);

      // Close loading message and show success
      loadingMessage();
      message.success(`Đã xóa ${selectedItems.length} sách khỏi giỏ hàng!`);
    } catch (error: any) {
      console.error("Error removing books from cart:", error);
      message.error(
        error.response?.data?.message ||
        "Có lỗi xảy ra khi xóa sách khỏi giỏ hàng!"
      );
    }
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      // Select all valid items (not locked or out of stock)
      const validItemIds = carts
        .filter(
          (item) => item.detail.bookStatus !== 0 && item.detail.bookQuantity > 0
        )
        .map((item) => item.id);
      setSelectedItems(validItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleNextStep = () => {
    if (!carts.length) {
      message.error("Không tồn tại sản phẩm trong giỏ hàng.");
      return;
    }

    // Kiểm tra xem có sách nào được chọn không
    if (selectedItems.length === 0) {
      message.error("Vui lòng chọn ít nhất một sách để thanh toán.");
      return;
    }

    // Kiểm tra xem có sách nào bị khóa hoặc hết hàng trong các sách đã chọn
    const hasLockedOrOutOfStockBooks = carts
      .filter(item => selectedItems.includes(item.id))
      .some(
        (item) => item.detail.bookStatus === 0 || item.detail.bookQuantity === 0
      );

    if (hasLockedOrOutOfStockBooks) {
      message.error(
        "Vui lòng xóa các sách bị khóa hoặc hết hàng khỏi danh sách đã chọn trước khi thanh toán."
      );
      return;
    }

    // Lưu danh sách sách đã chọn vào localStorage để sử dụng ở bước tiếp theo
    const selectedCarts = carts.filter(item => selectedItems.includes(item.id));
    localStorage.setItem("selectedCarts", JSON.stringify(selectedCarts));

    setCurrentStep(1);
  };

  return (
    <div className="order-page-container">
      <div className="order-container">
        {/* Hiển thị cảnh báo nếu có sách bị khóa hoặc hết hàng */}
        {(warnings.locked.length > 0 || warnings.outOfStock.length > 0) && (
          <div style={{ marginBottom: 16 }}>
            {warnings.locked.length > 0 && (
              <Alert
                message="Sách bị khóa"
                description={
                  <div>
                    <p>Các sách sau đã bị khóa và không thể mua:</p>
                    <ul>
                      {warnings.locked.map((title, index) => (
                        <li key={`locked-${index}`}>{title}</li>
                      ))}
                    </ul>
                    <p>
                      Vui lòng xóa các sách này khỏi giỏ hàng trước khi thanh
                      toán.
                    </p>
                  </div>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 8 }}
              />
            )}

            {warnings.outOfStock.length > 0 && (
              <Alert
                message="Sách hết hàng"
                description={
                  <div>
                    <p>Các sách sau đã hết hàng:</p>
                    <ul>
                      {warnings.outOfStock.map((title, index) => (
                        <li key={`outofstock-${index}`}>{title}</li>
                      ))}
                    </ul>
                    <p>
                      Vui lòng xóa các sách này khỏi giỏ hàng trước khi thanh
                      toán.
                    </p>
                  </div>
                }
                type="warning"
                showIcon
              />
            )}
          </div>
        )}

        <Row gutter={[24, 24]}>
          <Col md={16} xs={24}>
            <div className="order-list">
              {/* Header with select all checkbox */}
              {carts.length > 0 && (
                <div
                  className="order-list-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    padding: "0 8px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    <span>Chọn tất cả</span>
                  </div>
                  {selectedItems.length > 0 && (
                    <Button
                      type="primary"
                      danger
                      onClick={handleRemoveSelectedBooks}
                      icon={<DeleteOutlined />}
                    >
                      Xóa đã chọn ({selectedItems.length})
                    </Button>
                  )}
                </div>
              )}

              {carts.map((item, index) => (
                <div className="order-book" key={`book-${index}`}>
                  <div
                    className="book-content"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) =>
                        handleSelectItem(item.id, e.target.checked)
                      }
                      disabled={
                        item.detail.bookStatus === 0 ||
                        item.detail.bookQuantity === 0
                      }
                      style={{ marginRight: 12 }}
                    />
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${item.detail.image
                        }`}
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
                  Thanh toán ({selectedItems.length})
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
