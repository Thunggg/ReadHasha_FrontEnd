import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    Breadcrumb,
    Button,
    Col,
    Divider,
    Image,
    InputNumber,
    Row,
    Spin,
    Typography,
    message,
    Tabs,
} from "antd";
import { HeartOutlined, MinusOutlined, PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { addBookToCartAPI, fetchAccountAPI, getBooksByIdAPI } from "@/services/api";
import { useCurrentApp } from "@/components/context/app.context";
// Remove or comment out the problematic import until we create the file
// import "@/styles/bookDetail.scss";

const { Title, Text, Paragraph } = Typography;
type UserAction = "MINUS" | "PLUS"

// Define the IBookDetail interface that extends IBook

const BookDetail = () => {
    const { id } = useParams();
    const [bookDetail, setBookDetail] = useState<IBook | null>(null);
    const [currentQuantity, setCurrentQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);
    const {
        user, isAuthenticated, setUser, setIsAuthenticated, carts, setCarts
    } = useCurrentApp();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookDetail = async () => {
            setLoading(true);
            try {
                if (id) {
                    const res = await getBooksByIdAPI(id);

                    if (res && res.data) {
                        setBookDetail(res.data);
                    } else {
                        message.error("Không thể tải thông tin sách");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch book detail:", error);
                message.error("Có lỗi xảy ra khi tải thông tin sách");
            } finally {
                setLoading(false);
            }
        };
        fetchBookDetail();
    }, [id]);

    // Add handlers for the buttons
    const handleAddToCart = async () => {
        if (!user) {
            message.error("Bạn cần đăng nhập để thực hiện tính năng này.");
            return;
        }

        if (!bookDetail) {
            message.error("Không tìm thấy thông tin sách!");
            return;
        }

        try {
            // Gọi API để thêm sách vào giỏ hàng trong database
            const response = await addBookToCartAPI(
                user.username,
                bookDetail.bookID,
                currentQuantity
            );

            if (response.statusCode === 200) {
                // Cập nhật lại giỏ hàng từ database
                const accountRes = await fetchAccountAPI();

                if (accountRes.data?.cartCollection) {
                    const cartsFromDB = accountRes.data.cartCollection.map(item => ({
                        id: item.bookID.bookID,
                        quantity: item.quantity,
                        detail: item.bookID
                    }));

                    setCarts(cartsFromDB);
                    localStorage.setItem("carts", JSON.stringify(cartsFromDB));
                } else {
                    setCarts([]);
                    localStorage.setItem("carts", JSON.stringify([]));
                }

                message.success("Đã thêm sách vào giỏ hàng!");
                return true;
            } else {
                message.error(response.message || "Xóa sách khỏi giỏ hàng thất bại!");
                return false;
            }
        } catch (error: any) {
            console.error("Error adding book to cart:", error);
            message.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm sách vào giỏ hàng!");
        }
    };

    const handleBuyNow = () => {
        if (!user) {
            message.error("Bạn cần đăng nhập để thực hiện tính năng này.")
            return;
        }
        //update localStorage
        const cartStorage = localStorage.getItem("carts");
        if (cartStorage && bookDetail) {
            //update
            const carts = JSON.parse(cartStorage) as ICart[];

            //check exist
            let isExistIndex = carts.findIndex(c => c.id === bookDetail.bookID);
            if (isExistIndex > -1) {
                carts[isExistIndex].quantity =
                    carts[isExistIndex].quantity + currentQuantity;
            } else {
                carts.push({
                    quantity: currentQuantity,
                    id: bookDetail.bookID,
                    detail: bookDetail
                })
            }

            localStorage.setItem("carts", JSON.stringify(carts));

            //sync React Context
            setCarts(carts);
        } else {
            //create
            const data = [{
                id: bookDetail?.bookID!,
                quantity: currentQuantity,
                detail: bookDetail!
            }]
            localStorage.setItem("carts", JSON.stringify(data))

            //sync React Context
            setCarts(data);
        }
        navigate("/order");
    };

    const handleChangeButton = (type: UserAction) => {
        if (type === 'MINUS') {
            if (currentQuantity - 1 <= 0) return;
            setCurrentQuantity(currentQuantity - 1);
        }
        if (type === 'PLUS' && bookDetail) {
            if (currentQuantity === +bookDetail.bookQuantity) return; //max
            setCurrentQuantity(currentQuantity + 1);
        }
    }

    const handleChangeInput = (value: string) => {
        // Xử lý trường hợp xóa hết input
        if (value === "") {
            setCurrentQuantity(1);
            return;
        }

        // Chỉ xử lý nếu là số
        if (!isNaN(+value)) {
            let newValue = parseInt(value);

            // Giới hạn giá trị trong khoảng 1 đến bookQuantity
            if (bookDetail) {
                newValue = Math.max(1, Math.min(newValue, +bookDetail.bookQuantity));
            } else {
                newValue = Math.max(1, newValue);
            }

            setCurrentQuantity(newValue);
        }
    };

    // Add tabs for book details
    const items = [
        {
            key: "1",
            label: "Thông tin chi tiết",
            children: (
                <div className="book-info">
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Text strong>Tác giả:</Text>
                        </Col>
                        <Col span={16}>
                            <Text>{bookDetail?.author || "Đang cập nhật"}</Text>
                        </Col>
                        <Col span={8}>
                            <Text strong>Nhà xuất bản:</Text>
                        </Col>
                        <Col span={16}>
                            <Text>{bookDetail?.publisher || "Đang cập nhật"}</Text>
                        </Col>
                        <Col span={8}>
                            <Text strong>Năm xuất bản:</Text>
                        </Col>
                        <Col span={16}>
                            <Text>{bookDetail?.publicationYear || "Đang cập nhật"}</Text>
                        </Col>
                        <Col span={8}>
                            <Text strong>Số trang:</Text>
                        </Col>
                        <Col span={16}>
                            <Text>{bookDetail?.hardcover || "Đang cập nhật"}</Text>
                        </Col>
                    </Row>
                </div>
            ),
        },
        {
            key: "2",
            label: "Mô tả sản phẩm",
            children: (
                <div className="book-description">
                    <Paragraph>
                        {bookDetail?.bookDescription ||
                            "Đang cập nhật thông tin sản phẩm..."}
                    </Paragraph>
                </div>
            ),
        },
    ];

    return (
        <>
            <style>
                {`
                    /* Ẩn spinner trong Chrome, Safari, Edge, Opera */
                    input::-webkit-outer-spin-button,
                    input::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    /* Ẩn spinner trong Firefox */
                    input[type=number] {
                        -moz-appearance: textfield;
                    }
                        `
                }
            </style>

            <div
                className="book-detail-container"
                style={{ padding: "20px 0", background: "#f5f5f5" }}
            >
                <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
                    <Breadcrumb
                        items={[
                            { title: <Link to="/">Trang chủ</Link> },
                            { title: <Link to="/">Sách</Link> },
                            { title: bookDetail?.bookTitle || "Chi tiết sách" },
                        ]}
                        style={{ margin: "10px 0 20px" }}
                    />

                    <Spin spinning={loading} tip="Đang tải...">
                        {bookDetail && (
                            <>
                                <div
                                    className="book-detail-main"
                                    style={{ background: "#fff", padding: 24, borderRadius: 8 }}
                                >
                                    <Row gutter={[32, 24]}>
                                        <Col xs={24} md={10} lg={8}>
                                            <Image
                                                src={`${import.meta.env.VITE_BACKEND_URL}${bookDetail.image
                                                    }`}
                                                alt={bookDetail.bookTitle.toString()}
                                                fallback="/fallback-image.png"
                                                style={{
                                                    width: "100%",
                                                    maxHeight: 500,
                                                    objectFit: "contain",
                                                }}
                                            />
                                        </Col>
                                        <Col xs={24} md={14} lg={16}>
                                            <Title level={3}>{bookDetail.bookTitle}</Title>
                                            <Text type="secondary">
                                                Tác giả: {bookDetail.author || "Đang cập nhật"}
                                            </Text>
                                            <div className="book-price" style={{ margin: "24px 0" }}>
                                                <Title level={2} style={{ color: "#ff4d4f", margin: 0 }}>
                                                    {new Intl.NumberFormat("vi-VN", {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }).format(bookDetail?.bookPrice ?? 0)}
                                                </Title>
                                            </div>
                                            <Divider />

                                            <div
                                                className="book-quantity"
                                                style={{
                                                    margin: "24px 0",
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <span style={{ marginRight: "16px", fontWeight: 600 }}>Số lượng</span>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        border: "1px solid #d9d9d9",
                                                        borderRadius: "4px",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => handleChangeButton("MINUS")}
                                                        style={{
                                                            background: "#fafafa",
                                                            border: "none",
                                                            padding: "8px 12px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <MinusOutlined />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        onChange={(event) => handleChangeInput(event.target.value)}
                                                        value={currentQuantity}
                                                        style={{
                                                            width: "60px",
                                                            textAlign: "center",
                                                            border: "none",
                                                            outline: "none",
                                                            padding: "8px",
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleChangeButton("PLUS")}
                                                        style={{
                                                            background: "#fafafa",
                                                            border: "none",
                                                            padding: "8px 12px",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <PlusOutlined />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="book-actions" style={{ margin: "24px 0" }}>
                                                <Row gutter={16}>
                                                    <Col>
                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            icon={<ShoppingCartOutlined />}
                                                            onClick={handleAddToCart}
                                                        >
                                                            Thêm vào giỏ hàng
                                                        </Button>
                                                    </Col>
                                                    <Col>
                                                        <Button
                                                            type="default"
                                                            size="large"
                                                            onClick={handleBuyNow}
                                                            style={{
                                                                background: "#ff4d4f",
                                                                color: "white",
                                                                borderColor: "#ff4d4f",
                                                            }}
                                                        >
                                                            Mua ngay
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>

                                <div
                                    className="book-detail-tabs"
                                    style={{
                                        marginTop: 24,
                                        background: "#fff",
                                        padding: 24,
                                        borderRadius: 8,
                                    }}
                                >
                                    <Tabs defaultActiveKey="1" items={items} />
                                </div>
                            </>
                        )}
                    </Spin>
                </div>
            </div>
        </>
    );
};

export default BookDetail;
