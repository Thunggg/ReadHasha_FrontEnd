import React from 'react';
import { Drawer, Descriptions, Tag, Typography, theme } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface DetailCategoryProps {
    openViewDetail: boolean;
    setOpenViewDetail: (open: boolean) => void;
    dataViewDetail: ICategory | null;
}

const DetailCategory: React.FC<DetailCategoryProps> = ({
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
}) => {
    const { token: { colorPrimary, colorTextSecondary, colorError, colorSuccess } } = theme.useToken();

    return (
        <Drawer
            title={
                <Typography.Title level={4} style={{ margin: 0 }}>
                    🗂️ Chi tiết danh mục
                </Typography.Title>
            }
            placement="right"
            onClose={() => setOpenViewDetail(false)}
            open={openViewDetail}
            width="40%"
            headerStyle={{
                padding: 24,
                borderBottom: `1px solid ${colorPrimary}33`,
            }}
            bodyStyle={{ padding: 24 }}
        >
            {dataViewDetail ? (
                <Descriptions
                    bordered
                    column={1}
                    labelStyle={{
                        fontWeight: 600,
                        color: colorTextSecondary,
                        width: '30%',
                    }}
                    contentStyle={{
                        backgroundColor: '#fafafa',
                    }}
                >
                    <Descriptions.Item label="ID" span={3}>
                        <Typography.Text strong>
                            #{dataViewDetail.catID}
                        </Typography.Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Tên danh mục">
                        <Typography.Text style={{ color: colorPrimary }}>
                            {dataViewDetail.catName}
                        </Typography.Text>
                    </Descriptions.Item>

                    <Descriptions.Item label="Mô tả">
                        {dataViewDetail.catDescription || (
                            <Typography.Text type="secondary">
                                Không có mô tả
                            </Typography.Text>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="Trạng thái">
                        <Tag
                            color={dataViewDetail.catStatus === 1 ? colorSuccess : colorError}
                            style={{ borderRadius: 12 }}
                        >
                            {dataViewDetail.catStatus === 1 ? 'ACTIVE' : 'INACTIVE'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 16,
                }}>
                    <InfoCircleOutlined style={{ fontSize: 32, color: colorTextSecondary }} />
                    <Typography.Text type="secondary">
                        Không tìm thấy thông tin chi tiết
                    </Typography.Text>
                </div>
            )}
        </Drawer>
    );
};

export default DetailCategory;