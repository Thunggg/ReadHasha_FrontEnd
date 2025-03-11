import React from 'react';
import { Descriptions, Modal, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface IDetailPromotionProps {
    openViewDetail: boolean;
    setOpenViewDetail: (value: boolean) => void;
    dataViewDetail: IPromotion;
}

const DetailPromotion: React.FC<IDetailPromotionProps> = ({
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
}) => {
    if (!dataViewDetail) return null;

    return (
        <Modal
            title="Chi tiết khuyến mãi"
            open={openViewDetail}
            onCancel={() => setOpenViewDetail(false)}
            footer={null}
            width={700}
        >
            <Descriptions bordered column={2}>
                <Descriptions.Item label="ID" span={2}>
                    {dataViewDetail.proID}
                </Descriptions.Item>

                <Descriptions.Item label="Tên khuyến mãi" span={2}>
                    <Typography.Text strong>{dataViewDetail.proName}</Typography.Text>
                </Descriptions.Item>

                <Descriptions.Item label="Mã khuyến mãi" span={2}>
                    <Tag color="blue">{dataViewDetail.proCode}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Giảm giá">
                    <Typography.Text type="danger" strong>
                        {dataViewDetail.discount}%
                    </Typography.Text>
                </Descriptions.Item>

                <Descriptions.Item label="Số lượng">
                    {dataViewDetail.quantity}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày bắt đầu">
                    {dayjs(dataViewDetail.startDate).format('DD/MM/YYYY')}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày kết thúc">
                    {dayjs(dataViewDetail.endDate).format('DD/MM/YYYY')}
                </Descriptions.Item>

                <Descriptions.Item label="Trạng thái" span={2}>
                    {dataViewDetail.proStatus === 1 ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                            Active
                        </Tag>
                    ) : (
                        <Tag icon={<CloseCircleOutlined />} color="error">
                            Inactive
                        </Tag>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label="Được tạo bởi">
                    {dataViewDetail.createdBy.username}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default DetailPromotion;
