import { FORMATE_DATE_VN } from "@/services/helper";
import { Avatar, Badge, Descriptions, Drawer, Image, Tag } from "antd";
import dayjs from 'dayjs';

interface IProps {
    openViewDetail: boolean;
    setOpenViewDetail: (v: boolean) => void;
    dataViewDetail: IBook | null;
    setDataViewDetail: (v: IBook | null) => void;

}
const DetailBook = (props: IProps) => {
    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;

    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }

    const bookImageURL = `${import.meta.env.VITE_BACKEND_URL}${dataViewDetail?.image}`
    return (
        <>
            <Drawer
                title="Chi tiết sách"
                width={"50vw"}
                onClose={onClose}
                open={openViewDetail}
                extra={
                    <Image
                        width={240}
                        src={bookImageURL}
                        alt="Ảnh bìa sách"
                        style={{
                            borderRadius: 8,
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            border: '1px solid #f0f0f0'
                        }}
                        preview={{
                            mask: <span style={{ color: '#fff' }}>Xem phóng to</span>
                        }}
                    />
                }
            >
                <div style={{ padding: '0 24px' }}>
                    {/* Header Section */}
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{
                            fontSize: 24,
                            marginBottom: 8,
                            color: '#1890ff',
                            fontWeight: 600
                        }}>
                            {dataViewDetail?.bookTitle}
                        </h2>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <Tag color="geekblue" style={{ fontSize: 14 }}>{dataViewDetail?.author}</Tag>
                            {dataViewDetail?.translator && (
                                <Tag color="cyan" style={{ fontSize: 14 }}>Dịch giả: {dataViewDetail.translator}</Tag>
                            )}
                        </div>
                    </div>

                    {/* Main Information */}
                    <Descriptions
                        bordered
                        column={2}
                        layout="vertical"
                        labelStyle={{
                            fontWeight: 600,
                            color: '#666',
                            width: '160px'
                        }}
                        contentStyle={{
                            background: '#fff',
                            fontSize: 15
                        }}
                    >
                        {/* Price & Status Row */}
                        <Descriptions.Item label="Giá bán" span={2}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 16
                            }}>
                                <span style={{
                                    fontSize: 20,
                                    color: '#cf1322',
                                    fontWeight: 600
                                }}>
                                    {dataViewDetail?.bookPrice
                                        ? new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(dataViewDetail.bookPrice)
                                        : 'Đang cập nhật'}
                                </span>
                                <Badge
                                    status={dataViewDetail?.bookStatus === 1 ? "success" : "error"}
                                    text={dataViewDetail?.bookStatus === 1 ?
                                        <span style={{ color: '#52c41a' }}>Còn bán</span> :
                                        <span style={{ color: '#ff4d4f' }}>Ngưng bán</span>}
                                />
                            </div>
                        </Descriptions.Item>

                        {/* Publisher & Year */}
                        <Descriptions.Item label="Xuất bản">
                            <div>
                                <div>{dataViewDetail?.publisher}</div>
                                <div style={{ color: '#666' }}>Năm XB: {dataViewDetail?.publicationYear}</div>
                            </div>
                        </Descriptions.Item>

                        {/* Stock & ISBN */}
                        <Descriptions.Item label="Thông tin kho">
                            <div>
                                <div>Số lượng: {dataViewDetail?.bookQuantity}</div>
                                <div>ISBN: {dataViewDetail?.isbn || '---'}</div>
                            </div>
                        </Descriptions.Item>

                        {/* Physical Details */}
                        <Descriptions.Item label="Thông số vật lý">
                            <div style={{ display: 'flex', gap: 24 }}>
                                <div>
                                    <div>Kích thước</div>
                                    <div style={{ fontWeight: 500 }}>{dataViewDetail?.dimension || '---'}</div>
                                </div>
                                <div>
                                    <div>Trọng lượng</div>
                                    <div style={{ fontWeight: 500 }}>{dataViewDetail?.weight ? `${dataViewDetail.weight}g` : '---'}</div>
                                </div>
                                <div>
                                    <div>Số trang</div>
                                    <div style={{ fontWeight: 500 }}>{dataViewDetail?.hardcover ? `${dataViewDetail.hardcover} trang` : '---'}</div>
                                </div>
                            </div>
                        </Descriptions.Item>

                        {/* Description */}
                        <Descriptions.Item label="Mô tả sách" span={2}>
                            <div style={{
                                lineHeight: 1.6,
                                color: '#333',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {dataViewDetail?.bookDescription || 'Chưa có mô tả chi tiết'}
                            </div>
                        </Descriptions.Item>

                        {/* Categories */}
                        <Descriptions.Item label="Danh mục" span={2}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {dataViewDetail?.bookCategories && dataViewDetail?.bookCategories?.length > 0
                                    ? dataViewDetail.bookCategories.map(cat => (
                                        <Tag
                                            key={cat.bookCateId}
                                            color="blue"
                                            style={{ borderRadius: 12, padding: '4px 12px' }}
                                        >
                                            {cat.catId.catName || "Uncategorized"}
                                        </Tag>
                                    ))
                                    : <span style={{ color: '#999' }}>Chưa được phân loại</span>}
                            </div>
                        </Descriptions.Item>
                    </Descriptions>

                    {/* Additional Decoration */}
                    <div style={{
                        marginTop: 24,
                        textAlign: 'center',
                        color: '#999',
                        fontSize: 12
                    }}>
                        ID Sách: {dataViewDetail?.bookID}
                    </div>
                </div>
            </Drawer>
        </>
    )
}
export default DetailBook;