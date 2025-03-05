import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { getBooksByIdAPI } from "@/services/api";
// Remove or comment out the problematic import until we create the file
// import "@/styles/bookDetail.scss";

const { Title, Text, Paragraph } = Typography;

// Define the IBookDetail interface that extends IBook

const BookDetail = () => {
    const { id } = useParams();
    const [bookDetail, setBookDetail] = useState<IBook | null>(null);
    const [quantity, setQuantity] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBookDetail = async () => {
            setLoading(true);
            try {
                if (id) {
                    console.log("Fetching book with ID:", id);
                    const res = await getBooksByIdAPI(id);
                    console.log(res);
                    console.log("Book Detail API Response:", res);
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
    const handleAddToCart = () => {
        message.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    };

    const handleBuyNow = () => {
        message.info("Chức năng mua ngay đang được phát triển");
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
                                        <div className="book-quantity" style={{ margin: "24px 0" }}>
                                            <Row align="middle" gutter={16}>
                                                <Col>
                                                    <Text strong>Số lượng:</Text>
                                                </Col>
                                                <Col>
                                                    <InputNumber
                                                        min={1}
                                                        max={99}
                                                        value={quantity}
                                                        onChange={(value) => setQuantity(value as number)}
                                                        style={{ width: 120 }}
                                                    />
                                                </Col>
                                            </Row>
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
                                                <Col>
                                                    <Button
                                                        type="default"
                                                        size="large"
                                                        icon={<HeartOutlined />}
                                                        style={{ borderColor: "#ff4d4f", color: "#ff4d4f" }}
                                                    >
                                                        Yêu thích
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
    );
};

export default BookDetail;
