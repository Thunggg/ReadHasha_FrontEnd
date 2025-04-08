import { getBookAPI, getCategoryAPI } from '@/services/api';
import { FilterTwoTone, ReloadOutlined } from '@ant-design/icons';
import {
    Row, Col, Form, Checkbox, Divider, InputNumber,
    Button, Rate, Tabs, Pagination, Spin
} from 'antd';
import type { FormProps } from 'antd';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import 'styles/home.scss';

type FieldType = {
    range: {
        from: number;
        to: number
    }
    category: string[]
};

const HomePage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // State management
    const [listCategory, setListCategory] = useState<ICategory[]>([]);
    const [listBook, setListBook] = useState<IBook[]>([]);
    const [current, setCurrent] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [filter, setFilter] = useState<string>("");
    const [sortQuery, setSortQuery] = useState<string>("sort=-sold");
    const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

    // Fetch categories on initial load
    useEffect(() => {
        const initCategory = async () => {
            const res = await getCategoryAPI();
            if (res && res.data) {
                const d = res.data.categories.map(item => item);
                setListCategory(d);
            }
        }
        initCategory();
    }, []);

    // Memoized fetch book function
    const fetchBook = useCallback(async () => {
        setIsLoading(true);
        try {
            let query = `current=${current}&pageSize=${pageSize}&homePage=true`;
            if (filter) query += `&${filter}`;
            if (sortQuery) query += `&${sortQuery}`;
            const res = await getBookAPI(query);
            if (res?.data) {
                setListBook(res.data.result);
                setTotal(res.data.meta.total);
            }
        } catch (error) {
            console.error("Fetch book error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [current, pageSize, filter, sortQuery]);

    // Trigger fetch when dependencies change
    useEffect(() => {
        fetchBook();
    }, [fetchBook]);

    // Memoized book rendering
    const renderedBooks = useMemo(() => {
        return listBook.map((item, index) => ({
            ...item,
            formattedPrice: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(item?.bookPrice ?? 0),
            renderComponent: (
                <div
                    onClick={() => navigate(`/book/${item.bookID}`)}
                    className="column"
                    key={`book-${index}`}
                >
                    <div className='wrapper'>
                        <div className='thumbnail'>
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}${item.image}`}
                                alt="thumbnail book"
                            />
                        </div>
                        <div className='text'>{item.bookTitle}</div>
                        <div className='price'>
                            {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                            }).format(item?.bookPrice ?? 0)}
                        </div>
                        <div className='rating'>
                            <Rate
                                value={5}
                                disabled
                                style={{ color: '#ffce3d', fontSize: 10 }}
                            />
                            <span>Đã bán {item.totalSold}</span>
                        </div>
                    </div>
                </div>
            )
        }));
    }, [listBook, navigate]);

    // Memoized page change handler
    const handleOnchangePage = useCallback((pagination: { current: number, pageSize: number }) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }
    }, [current, pageSize]);

    // Handle filter changes
    const handleChangeFilter = useCallback((changedValues: any, values: any) => {
        if (changedValues.category) {
            const cate = values.category;
            if (cate && cate.length > 0) {
                const f = cate.join(',');
                setFilter(`categoryIds=${f}`)
            } else {
                setFilter('');
            }
        }
    }, []);

    // Price filter submission
    const onFinish: FormProps<FieldType>['onFinish'] = useCallback(async (values: any) => {
        if (values?.range?.from >= 0 && values?.range?.to >= 0) {
            let f = `minPrice=${values?.range?.from}&maxPrice=${values?.range?.to}`;
            if (values?.category?.length) {
                const cate = values?.category?.join(',');
                f += `&categoryIds=${cate}`
            }
            setFilter(f);
        }
    }, []);

    // Sort items
    const items = [
        { key: "sort=-sold", label: `Phổ biến`, children: <></> },
        { key: 'sort=-publicationYear', label: `Hàng Mới`, children: <></> },
        { key: 'sort=bookPrice', label: `Giá Thấp Đến Cao`, children: <></> },
        { key: 'sort=-bookPrice', label: `Giá Cao Đến Thấp`, children: <></> },
    ];

    return (
        <>
            <div style={{ background: '#efefef', padding: "20px 0" }}>
                <div className="homepage-container" style={{ maxWidth: 1440, margin: '0 auto', overflow: "hidden" }}>
                    <Row gutter={[20, 20]}>
                        <Col md={4} sm={0} xs={0}>
                            <div className="filter-container" style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                                <div style={{ display: 'flex', justifyContent: "space-between" }}>
                                    <span>
                                        <FilterTwoTone />
                                        <span style={{ fontWeight: 500 }}> Bộ lọc tìm kiếm</span>
                                    </span>
                                    <ReloadOutlined
                                        title="Reset"
                                        onClick={() => {
                                            form.resetFields();
                                            setFilter('');
                                        }}
                                    />
                                </div>
                                <Divider />
                                <Form
                                    onFinish={onFinish}
                                    form={form}
                                    onValuesChange={handleChangeFilter}
                                >
                                    <Form.Item
                                        name="category"
                                        label="Danh mục sản phẩm"
                                        labelCol={{ span: 24 }}
                                    >
                                        <Checkbox.Group>
                                            <Row>
                                                {listCategory?.map((item, index) => (
                                                    <Col span={24} key={`index-${index}`} style={{ padding: '7px 0' }}>
                                                        <Checkbox value={item.catID}>
                                                            {item.catName}
                                                        </Checkbox>
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Checkbox.Group>
                                    </Form.Item>
                                    <Divider />
                                    {/* <Form.Item
                                        label="Khoảng giá"
                                        labelCol={{ span: 24 }}
                                    >
                                        <Row gutter={[10, 10]} style={{ width: "100%" }}>
                                            <Col xl={11} md={24}>
                                                <Form.Item name={["range", 'from']}>
                                                    <InputNumber
                                                        name='from'
                                                        min={0}
                                                        placeholder="đ TỪ"
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col xl={2} md={0}>
                                                <div> - </div>
                                            </Col>
                                            <Col xl={11} md={24}>
                                                <Form.Item name={["range", 'to']}>
                                                    <InputNumber
                                                        name='to'
                                                        min={0}
                                                        placeholder="đ ĐẾN"
                                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <div>
                                            <Button
                                                onClick={() => form.submit()}
                                                style={{ width: "100%" }}
                                                type='primary'
                                            >
                                                Áp dụng
                                            </Button>
                                        </div>
                                    </Form.Item> */}
                                </Form>
                            </div>
                        </Col>

                        <Col md={20} xs={24}>
                            <Spin spinning={isLoading} size='large' tip="Loading...">
                                <div style={{ padding: "20px", background: '#fff', borderRadius: 5 }}>
                                    <Row>
                                        <Tabs
                                            defaultActiveKey="sort=-sold"
                                            items={items}
                                            onChange={(value) => { setSortQuery(value) }}
                                            style={{ overflowX: "auto", fontSize: "16px" }}
                                            className="custom-tabs"
                                        />
                                        <Col xs={24} md={0}>
                                            <div style={{ marginBottom: 20 }}>
                                                <span onClick={() => setShowMobileFilter(true)}>
                                                    <FilterTwoTone />
                                                    <span style={{ fontWeight: 500 }}> Lọc</span>
                                                </span>
                                            </div>
                                        </Col>
                                    </Row>
                                    <Row className='customize-row'>
                                        {renderedBooks.length > 0 ? (
                                            renderedBooks.map(book => book.renderComponent)
                                        ) : (
                                            !isLoading && (
                                                <div style={{
                                                    width: '100%',
                                                    padding: '40px 20px',
                                                    textAlign: 'center',
                                                    backgroundColor: '#f8f9fa',
                                                    borderRadius: 8,
                                                    margin: '20px 0'
                                                }}>
                                                    <div style={{
                                                        fontSize: 48,
                                                        color: '#ced4da',
                                                        marginBottom: 16
                                                    }}>
                                                        <i className="far fa-folder-open"></i>
                                                    </div>

                                                    <h3 style={{
                                                        color: '#495057',
                                                        fontSize: 20,
                                                        fontWeight: 500,
                                                        marginBottom: 8
                                                    }}>
                                                        Không tìm thấy sách phù hợp
                                                    </h3>

                                                    <p style={{
                                                        color: '#868e96',
                                                        fontSize: 14,
                                                        lineHeight: 1.5,
                                                        maxWidth: 500,
                                                        margin: '0 auto'
                                                    }}>
                                                        Hãy thử điều chỉnh bộ lọc hoặc thử các từ khóa tìm kiếm khác nhau.
                                                        <br />
                                                        Bạn cũng có thể xem các danh mục sách phổ biến của chúng tôi.
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </Row>
                                    <div style={{ marginTop: 30 }}></div>
                                    <Row style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                                        <Pagination
                                            current={current}
                                            total={total}
                                            pageSize={pageSize}
                                            responsive
                                            showSizeChanger
                                            onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                                        />
                                    </Row>
                                </div>
                            </Spin>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    )
}

export default HomePage;