/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Col,
  Divider,
  Form,
  message,
  notification,
  Radio,
  Row,
  Space,
  Typography,
  Input,
  Card,
  Tag,
  Alert,
  Empty,
} from "antd";
import { DeleteOutlined, LeftOutlined, GiftOutlined } from "@ant-design/icons";
import { useEffect, useState, useMemo } from "react";
import { useCurrentApp } from "@/components/context/app.context";
import type { FormProps } from "antd";
import "@/styles/payment.scss";
import {
  CreateOrderAPI,
  deleteBookFromCartAPI,
  getPromotionsAPI,
  getUsedPromotionsAPI,
  updatePromotionAPI,
  getBooksByIdAPI,
} from "@/services/api";
import axios from "axios";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type UserMethod = "COD" | "BANKING";

type FieldType = {
  fullName: string;
  phone: string;
  address: string;
  method: UserMethod;
  promotionCode?: string;
};

interface IProps {
  setCurrentStep: (v: number) => void;
  isBuyNow?: boolean;
}

const Payment = (props: IProps) => {
  const { carts: allCarts, setCarts: setContextCarts, user } = useCurrentApp();
  const [localCarts, setLocalCarts] = useState<ICart[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const { setCurrentStep, isBuyNow = false } = props;
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [usedPromotions, setUsedPromotions] = useState<IPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<IPromotion | null>(
    null
  );
  const [filteredPromotions, setFilteredPromotions] = useState<IPromotion[]>(
    []
  );
  const [showAllPromotions, setShowAllPromotions] = useState(false);

  // Lấy danh sách sản phẩm đã chọn từ localStorage khi component mount
  useEffect(() => {
    const selectedCartsStr = localStorage.getItem("selectedCarts");
    if (selectedCartsStr) {
      const selectedCarts = JSON.parse(selectedCartsStr) as ICart[];
      setLocalCarts(selectedCarts);
    } else {
      setLocalCarts(allCarts);
    }
  }, [allCarts]);

  // Fetch promotions and used promotions when component mounts
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const [promotionsResponse, usedPromotionsResponse] = await Promise.all([
          getPromotionsAPI(),
          user ? getUsedPromotionsAPI(user.username) : Promise.resolve({ data: [], statusCode: 200 })
        ]);

        if (promotionsResponse && promotionsResponse.statusCode === 200 && promotionsResponse.data) {
          setPromotions(promotionsResponse.data);
          setFilteredPromotions(promotionsResponse.data);
        }

        if (usedPromotionsResponse && usedPromotionsResponse.statusCode === 200 && usedPromotionsResponse.data) {
          setUsedPromotions(usedPromotionsResponse.data);
        }
      } catch (error) {
        console.error("Error fetching promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [user]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.firstName + " " + user.lastName,
        phone: user.phone,
        method: "COD",
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (localCarts && localCarts.length > 0) {
      let sum = 0;
      localCarts.forEach((item) => {
        sum += item.quantity * item.detail.bookPrice;
      });
      setTotalPrice(sum);

      // Tính lại giá cuối cùng khi totalPrice thay đổi
      calculateFinalPrice(sum, selectedPromotion);
    } else {
      setTotalPrice(0);
      setFinalPrice(0);
      setDiscountAmount(0);
    }
  }, [localCarts, selectedPromotion]);

  const calculateFinalPrice = (price: number, promotion: IPromotion | null) => {
    if (!promotion) {
      setFinalPrice(price);
      setDiscountAmount(0);
      return;
    }

    const discount = price * (promotion.discount / 100);
    setDiscountAmount(discount);
    setFinalPrice(price - discount);
  };

  const handleRemoveBook = (_id: number) => {
    const cartStorage = localStorage.getItem("carts");
    if (cartStorage) {
      //update
      const carts = JSON.parse(cartStorage) as ICart[];
      const newCarts = carts.filter((item) => item.id !== _id);
      localStorage.setItem("carts", JSON.stringify(newCarts));
      //sync React Context
      setContextCarts(newCarts);
    }
  };

  const handleSelectPromotion = (promotion: IPromotion) => {
    setSelectedPromotion(promotion);
    form.setFieldsValue({ promotionCode: promotion.proCode });
    calculateFinalPrice(totalPrice, promotion);
    message.success(
      `Đã áp dụng mã giảm giá: ${promotion.proName} (-${promotion.discount}%)`
    );
  };

  // Kiểm tra xem mã giảm giá có còn hiệu lực không và chưa được sử dụng
  const isPromotionValid = (promotion: IPromotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    const isUsed = usedPromotions.some(used => used.proID === promotion.proID);

    return (
      now >= startDate &&
      now <= endDate &&
      promotion.quantity > 0 &&
      promotion.proStatus === 1 &&
      !isUsed
    );
  };

  // Format date để hiển thị
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Hiển thị số lượng mã giảm giá giới hạn khi không bấm "Xem thêm"
  const displayedPromotions = useMemo(() => {
    const promos = filteredPromotions.length > 0 ? filteredPromotions : promotions;
    const validPromos = promos.filter(promo => isPromotionValid(promo));
    return showAllPromotions ? validPromos : validPromos.slice(0, 6);
  }, [filteredPromotions, promotions, showAllPromotions, usedPromotions]);

  const handlePlaceOrder: FormProps<FieldType>["onFinish"] = async (values) => {
    const { address, method } = values;

    // Kiểm tra xác thực user
    if (!user) {
      notification.error({
        message: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để tiếp tục",
      });
      return;
    }

    // Kiểm tra giỏ hàng có sản phẩm hay không
    if (!localCarts?.length) {
      notification.warning({
        message: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng",
      });
      return;
    }

    setIsSubmit(true);

    try {
      // Kiểm tra số lượng sách trong kho cho từng sản phẩm
      const stockValidationErrors = [];

      for (const item of localCarts) {
        // Lấy thông tin sách hiện tại để kiểm tra số lượng trong kho
        const bookResponse = await getBooksByIdAPI(item.id.toString());

        if (bookResponse && bookResponse.data) {
          const book = bookResponse.data;

          // Kiểm tra nếu số lượng trong giỏ hàng vượt quá số lượng tồn kho
          if (item.quantity > book.bookQuantity) {
            stockValidationErrors.push({
              bookTitle: book.bookTitle,
              requested: item.quantity,
              available: book.bookQuantity
            });
          }
        }
      }

      // Nếu có lỗi về số lượng tồn kho, hiển thị thông báo và không tiếp tục
      if (stockValidationErrors.length > 0) {
        const errorMessages = stockValidationErrors.map(err =>
          `${err.bookTitle}: yêu cầu ${err.requested}, chỉ còn ${err.available} sản phẩm`
        );

        notification.error({
          message: "Không đủ hàng trong kho",
          description: (
            <div>
              <p>Một số sản phẩm trong giỏ hàng của bạn đã hết hoặc không đủ số lượng:</p>
              <ul>
                {errorMessages.map((msg, index) => (
                  <li key={index}>{msg}</li>
                ))}
              </ul>
              <p>Vui lòng cập nhật giỏ hàng của bạn.</p>
            </div>
          ),
          duration: 0, // Hiển thị cho đến khi người dùng đóng
        });

        setIsSubmit(false);
        return;
      }

      // Xây dựng payload đơn hàng
      const orderPayload: IOrderRequest = {
        username: user.username,
        address,
        details: localCarts.map((item) => ({
          bookId: item.id,
          quantity: item.quantity,
        })),
        // Thêm mã giảm giá nếu có
        promotionID: selectedPromotion?.proID,
        finalPrice: finalPrice,
      };

      // Nếu phương thức thanh toán là VNPay
      if (method === "BANKING") {
        try {
          const orderId = Date.now().toString();
          const amount = Math.round(finalPrice || totalPrice);
          const orderInfo = "Payment for books";

          console.log("Sending payment data:", {
            orderId,
            amount,
            orderInfo,
          });

          // Gửi request với params trong URL
          const paymentResponse = await axios.post(
            "http://localhost:8080/api/payment/create-payment",
            null,
            {
              params: {
                orderId,
                amount,
                orderInfo,
              },
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          console.log("Payment response:", paymentResponse.data);

          if (paymentResponse.data && paymentResponse.data.paymentUrl) {
            // Lưu thông tin đơn hàng vào localStorage để xử lý sau khi thanh toán
            localStorage.setItem(
              "pendingOrder",
              JSON.stringify({
                orderData: orderPayload,
                isBuyNow,
              })
            );

            // Chuyển hướng đến trang thanh toán VNPay
            window.location.href = paymentResponse.data.paymentUrl;
          } else {
            throw new Error("Không nhận được URL thanh toán");
          }
        } catch (error: any) {
          console.error("Payment error details:", error);

          // Hiển thị thông tin lỗi chi tiết hơn
          let errorMessage = "Không thể kết nối đến cổng thanh toán";

          if (error.response) {
            // Lỗi từ phản hồi của server
            console.error("Error response data:", error.response.data);
            console.error("Error response status:", error.response.status);

            if (error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.status === 500) {
              errorMessage =
                "Lỗi máy chủ nội bộ (500). Vui lòng kiểm tra cấu hình VNPay trên server.";
            } else if (error.response.status === 400) {
              errorMessage =
                "Dữ liệu thanh toán không hợp lệ (400). Vui lòng kiểm tra thông tin thanh toán.";
            }
          } else if (error.request) {
            // Không nhận được phản hồi từ server
            errorMessage =
              "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.";
          } else if (error.message) {
            // Lỗi khác
            errorMessage = error.message;
          }

          notification.error({
            message: "Lỗi thanh toán",
            description: errorMessage,
            duration: 5,
          });
          setIsSubmit(false);
        }
        return;
      }

      // Nếu phương thức thanh toán là COD, tiếp tục xử lý đơn hàng như bình thường
      const res = await CreateOrderAPI(orderPayload);

      if (res && res.statusCode === 200) {
        message.success("Đặt hàng thành công!");

        // Cập nhật số lượng mã giảm giá nếu có sử dụng
        if (selectedPromotion) {
          try {
            // Giảm số lượng mã giảm giá đi 1
            const updatedPromotion = {
              ...selectedPromotion,
              quantity: selectedPromotion.quantity - 1,
              updatedBy: user.username
            };

            await updatePromotionAPI(updatedPromotion);

            // Cập nhật lại danh sách mã giảm giá đã sử dụng
            const usedPromotionsResponse = await getUsedPromotionsAPI(user.username);
            if (usedPromotionsResponse && usedPromotionsResponse.statusCode === 200 && usedPromotionsResponse.data) {
              setUsedPromotions(usedPromotionsResponse.data);
            }
          } catch (error) {
            console.error("Error updating promotion quantity:", error);
          }
        }

        // Xóa từng sản phẩm trong giỏ hàng từ database
        if (user && !isBuyNow) {
          const deletePromises = localCarts.map((item) =>
            deleteBookFromCartAPI(user.username, item.id)
          );
          await Promise.all(deletePromises);
        }

        // Nếu là mua ngay, xóa giỏ hàng tạm thời
        if (isBuyNow) {
          // Xóa buyNowItem trong localStorage
          localStorage.removeItem("buy_now_item");
        } else {
          // Nếu là mua từ giỏ hàng, xóa giỏ hàng trong localStorage
          localStorage.removeItem("carts");
          localStorage.removeItem("selectedCarts");
        }

        setLocalCarts([]);
        setContextCarts([]);
        setCurrentStep(2);
      } else {
        notification.error({
          message: "Lỗi đặt hàng",
          description: res.message || "Có lỗi xảy ra khi xử lý đơn hàng",
          duration: 5,
        });
      }
    } catch (error: any) {
      notification.error({
        message: "Lỗi hệ thống",
        description: error.response?.data?.message || "Lỗi kết nối đến máy chủ",
        duration: 5,
      });
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div className="payment-container">
      <Button
        type="link"
        icon={<LeftOutlined />}
        onClick={() => setCurrentStep(0)}
        className="back-button"
      >
        {isBuyNow ? "Quay lại thông tin sản phẩm" : "Quay lại giỏ hàng"}
      </Button>

      <Row gutter={[24, 24]}>
        <Col md={16} xs={24}>
          <div className="product-list">
            <Title level={4} className="section-title">
              Sản phẩm đặt mua ({localCarts.length})
            </Title>
            {localCarts.map((item, index) => (
              <div className="order-item" key={`item-${index}`}>
                <div className="item-content">
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${item.detail.image
                      }`}
                    className="product-image"
                  />
                  <div className="item-info">
                    <div className="product-name">{item.detail.bookTitle}</div>
                    <div className="product-quantity">
                      Số lượng: {item.quantity}
                    </div>
                    <div className="product-price">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.detail.bookPrice * item.quantity)}
                    </div>
                  </div>
                </div>
                <DeleteOutlined
                  className="delete-icon"
                  onClick={() => handleRemoveBook(item.id)}
                />
              </div>
            ))}
          </div>

          {/* Phần mã giảm giá */}
          <div
            className="promotion-section"
            style={{
              marginTop: 24,
              background: "#fff",
              padding: 24,
              borderRadius: 8,
            }}
          >
            <Title level={4} className="section-title">
              <GiftOutlined style={{ marginRight: 8 }} />
              Mã giảm giá
            </Title>

            {promotions.length > 0 ? (
              <>
                <div
                  className="available-promotions"
                  style={{ marginBottom: 24 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Text strong style={{ fontSize: 16 }}>
                      Chọn mã giảm giá:
                    </Text>
                    <Input.Search
                      placeholder="Tìm mã giảm giá"
                      style={{ width: 250 }}
                      onSearch={(value) => {
                        // Tìm kiếm mã giảm giá theo tên hoặc mã
                        const filtered = promotions.filter(
                          (p) =>
                            p.proName
                              .toLowerCase()
                              .includes(value.toLowerCase()) ||
                            p.proCode
                              .toLowerCase()
                              .includes(value.toLowerCase())
                        );
                        setFilteredPromotions(filtered);
                      }}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setFilteredPromotions(promotions);
                        }
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <Radio.Group
                      defaultValue="valid"
                      buttonStyle="solid"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "all") {
                          setFilteredPromotions(promotions);
                        } else if (value === "valid") {
                          setFilteredPromotions(
                            promotions.filter((p) => isPromotionValid(p))
                          );
                        } else if (value === "highest") {
                          setFilteredPromotions(
                            [...promotions].sort(
                              (a, b) => b.discount - a.discount
                            )
                          );
                        }
                      }}
                    >
                      <Radio.Button value="valid" checked={true}>
                        Có hiệu lực
                      </Radio.Button>
                      <Radio.Button value="highest">
                        Giảm nhiều nhất
                      </Radio.Button>
                    </Radio.Group>
                  </div>

                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      padding: "0 4px",
                    }}
                  >
                    {displayedPromotions.length > 0 ? (
                      <Row gutter={[16, 16]}>
                        {displayedPromotions.map((promo) => {
                          const isValid = isPromotionValid(promo);
                          const isSelected =
                            selectedPromotion?.proID === promo.proID;

                          return (
                            <Col xs={24} sm={12} key={promo.proID}>
                              <Card
                                hoverable={isValid}
                                style={{
                                  borderRadius: 8,
                                  borderColor: isSelected
                                    ? "#1890ff"
                                    : isValid
                                      ? "#d9d9d9"
                                      : "#f5f5f5",
                                  backgroundColor: isValid ? "#fff" : "#f5f5f5",
                                  cursor: isValid ? "pointer" : "not-allowed",
                                  boxShadow: isSelected
                                    ? "0 0 0 2px rgba(24,144,255,0.2)"
                                    : "none",
                                }}
                                onClick={() =>
                                  isValid && handleSelectPromotion(promo)
                                }
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div>
                                    <Tag
                                      color="blue"
                                      style={{
                                        padding: "4px 8px",
                                        marginRight: 8,
                                      }}
                                    >
                                      {promo.proCode}
                                    </Tag>
                                    <Text strong style={{ fontSize: 16 }}>
                                      {promo.proName}
                                    </Text>
                                  </div>
                                  <div>
                                    <Text
                                      style={{
                                        fontSize: 18,
                                        color: "#f5222d",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      -{promo.discount}%
                                    </Text>
                                  </div>
                                </div>

                                <Paragraph style={{ margin: "12px 0 8px" }}>
                                  <Text type="secondary">
                                    Còn lại: {promo.quantity} lượt sử dụng
                                  </Text>
                                </Paragraph>

                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 13 }}
                                  >
                                    Hiệu lực:{" "}
                                    {formatDate(promo.startDate.toString())} -{" "}
                                    {formatDate(promo.endDate.toString())}
                                  </Text>

                                  {isSelected && (
                                    <Tag color="success">Đã chọn</Tag>
                                  )}
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không tìm thấy mã giảm giá nào phù hợp"
                      />
                    )}
                  </div>

                  {filteredPromotions.length > 6 && (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                      <Button
                        type="link"
                        onClick={() => setShowAllPromotions(!showAllPromotions)}
                      >
                        {showAllPromotions
                          ? "Thu gọn"
                          : `Xem thêm ${filteredPromotions.length - 6
                          } mã giảm giá`}
                      </Button>
                    </div>
                  )}
                </div>

                <Divider style={{ margin: "16px 0" }} />

                {selectedPromotion && (
                  <div style={{ marginTop: 16 }}>
                    <Alert
                      message={`Đã áp dụng mã giảm giá: ${selectedPromotion.proName}`}
                      description={`Bạn được giảm ${selectedPromotion.discount}% tổng giá trị đơn hàng`}
                      type="success"
                      showIcon
                    />
                  </div>
                )}
              </>
            ) : (
              <Text type="secondary">
                Hiện không có mã giảm giá nào khả dụng
              </Text>
            )}
          </div>
        </Col>

        <Col md={8} xs={24}>
          <Form
            form={form}
            name="payment-form"
            onFinish={handlePlaceOrder}
            autoComplete="off"
            layout="vertical"
            className="payment-form"
          >
            <div className="payment-summary">
              <Title level={4} className="section-title">
                Thông tin thanh toán
              </Title>

              <Form.Item<FieldType>
                label="Hình thức thanh toán"
                name="method"
                className="form-item"
              >
                <Radio.Group className="payment-methods">
                  <Space direction="vertical">
                    <Radio value="COD" className="payment-method">
                      <span className="method-title">
                        Thanh toán khi nhận hàng (COD)
                      </span>
                      <span className="method-description">
                        Nhận hàng và thanh toán tại nhà
                      </span>
                    </Radio>
                    <Radio value="BANKING" className="payment-method">
                      <span className="method-title">Ví điện tử VNPAY</span>
                      <span className="method-description">
                        Thanh toán qua cổng VNPAY
                      </span>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item<FieldType>
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                className="form-item"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item<FieldType>
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
                className="form-item"
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item<FieldType>
                label="Địa chỉ nhận hàng"
                name="address"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                className="form-item"
              >
                <TextArea rows={3} size="large" />
              </Form.Item>

              <Divider className="summary-divider" />

              <div className="price-summary">
                <div className="price-row">
                  <span>Tạm tính:</span>
                  <span>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalPrice)}
                  </span>
                </div>

                {selectedPromotion && (
                  <div className="price-row discount">
                    <span>Giảm giá ({selectedPromotion.discount}%):</span>
                    <span style={{ color: "#f5222d" }}>
                      -
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="price-row total">
                  <span>Tổng tiền:</span>
                  <span className="total-price">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedPromotion ? finalPrice : totalPrice)}
                  </span>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isSubmit}
                block
                className="submit-button"
              >
                Đặt hàng ngay
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default Payment;
