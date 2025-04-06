import { useState, useEffect } from 'react';
import { FaReact } from 'react-icons/fa';
import { VscSearchFuzzy } from 'react-icons/vsc';
import { Divider, Drawer, AutoComplete, Input, Popover, Badge, Empty, Button } from 'antd';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import './app.header.scss';
import { Link } from 'react-router-dom';
import { useCurrentApp } from 'components/context/app.context';
import { logoutAPI, getBookAPI } from '@/services/api';
import { FiShoppingCart } from 'react-icons/fi';
import ManageAccount from '@/components/client/account';

interface IProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
}

const AppHeader = (props: IProps) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    // Lưu gợi ý tìm kiếm dưới dạng mảng IBook
    const [suggestions, setSuggestions] = useState<IBook[]>([]);
    const { isAuthenticated, user, setUser, setIsAuthenticated, carts, setCarts } = useCurrentApp();
    const [openManageAccount, setOpenManageAccount] = useState<boolean>(false);

    const navigate = useNavigate();

    // Hàm fetch gợi ý tìm kiếm (không giới hạn bản ghi)
    const fetchSuggestions = async (searchText: string) => {
        try {
            const res = await getBookAPI(`mainText=${encodeURIComponent(searchText)}&pageSize=100&homePage=true`);
            if (res?.data?.result) {
                const books = res.data.result.map((book: IBook) => ({
                    ...book,
                    image: "http://localhost:8080" + book.image
                }));
                setSuggestions(books);
            }
        } catch (error) {
            console.error("Lỗi tải gợi ý:", error);
        }
    };

    // Xử lý tìm kiếm với debounce
    const handleSearch = (value: string) => {
        props.setSearchTerm(value);
        if (value.trim()) {
            fetchSuggestions(value);
        } else {
            setSuggestions([]);
        }
    };

    // Xử lý đăng xuất
    const handleLogout = async () => {
        const res = await logoutAPI();
        if (res) {
            setUser(null);
            setIsAuthenticated(false);
            setCarts([]);
            localStorage.removeItem("access_token");
            localStorage.removeItem("carts");
        }
    };

    // Menu dropdown tài khoản
    const items = [
        ...(user?.role === 0 ? [{
            label: <Link to='/admin'>Trang quản trị</Link>,
            key: 'admin',
        }] : []),
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => setOpenManageAccount(true)}
            >Quản lý tài khoản</label>,
            key: 'account',
        },
        {
            label: <Link to="/history">Lịch sử mua hàng</Link>,
            key: 'history',
        },
        {
            label: <div onClick={handleLogout}>Đăng xuất</div>,
            key: 'logout',
        },
    ];

    const contentPopover = () => {
        return (
            <div className='cart-popover'>
                <div className='cart-header'>
                    <h3>Giỏ hàng của bạn ({carts.length})</h3>
                </div>

                <div className='cart-items'>
                    {carts.length > 0 ? (
                        carts.map((book, index) => (
                            <div className='cart-item' key={`book-${index}`}>
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}${book.detail?.image}`}
                                    // alt={book.detail?.bookTitle}
                                    className='book-image'
                                />
                                <div className='item-info'>
                                    <h4 className='book-title'>{book.detail?.bookTitle}</h4>
                                    <div className='item-details'>
                                        <span className='quantity'>Số lượng: {book.quantity}</span>
                                        <span className='price'>
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND'
                                            }).format((book.detail?.bookPrice ?? 0) * book.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={<span className='empty-text'>Giỏ hàng trống</span>}
                        />
                    )}
                </div>

                {carts.length > 0 && (
                    <div className='cart-footer'>
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                navigate('/order');
                                document.body.click(); // Đóng popover
                            }}
                            className='view-cart-btn'
                        >
                            Xem chi tiết giỏ hàng
                        </Button>
                    </div>
                )}
            </div>
        )
    }


    return (
        <>
            <div className='header-container'>
                <header className="page-header">
                    <div className="page-header__top">
                        <div className="page-header__toggle" onClick={() => setOpenDrawer(true)}>☰</div>
                        <div className='page-header__logo'>
                            <span className='logo' onClick={() => navigate('/')}>
                                <FaReact className='rotate icon-react' />
                                ReadHasha
                                <VscSearchFuzzy className='icon-search' />
                            </span>

                            <AutoComplete
                                options={suggestions.map(suggestion => ({
                                    value: suggestion.bookTitle,
                                    id: suggestion.bookID, // thêm id vào option
                                    label: (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={suggestion.image}
                                                style={{ width: '40px', height: '60px', objectFit: 'cover', marginRight: '8px' }}
                                            />
                                            <span>{suggestion.bookTitle}</span>
                                        </div>
                                    )
                                }))}
                                onSelect={(value, option) => {
                                    props.setSearchTerm(value);
                                    navigate(`/book/${option.id}`); // sử dụng option.id
                                }}
                                onSearch={handleSearch}
                                value={props.searchTerm}
                                style={{ width: 500 }}
                                popupClassName="search-suggestions"
                            >
                                <Input
                                    size="large"
                                    placeholder="Bạn tìm gì hôm nay"
                                    prefix={<VscSearchFuzzy />}
                                    allowClear
                                />
                            </AutoComplete>

                        </div>
                    </div>

                    <nav className="page-header__bottom">
                        <ul className="navigation">
                            <li className="navigation__item">

                                <Popover
                                    className="popover-carts"
                                    placement="topRight"
                                    rootClassName="popover-carts"
                                    content={contentPopover}
                                    arrow={true}>
                                    <Badge
                                        count={carts?.length ?? 0}
                                        size={"small"}
                                        showZero
                                    >
                                        <FiShoppingCart className='icon-cart' />
                                    </Badge>
                                </Popover>
                            </li>
                            <li className="navigation__item">
                                {!isAuthenticated ? (
                                    <span onClick={() => navigate('/login')}>Đăng nhập</span>
                                ) : (
                                    <Dropdown menu={{ items }} trigger={['click']}>
                                        <Space className="account-menu">
                                            <span>{user?.username}</span>
                                        </Space>
                                    </Dropdown>
                                )}
                            </li>
                        </ul>
                    </nav>
                </header>
            </div>

            <Drawer
                title="Menu chức năng"
                placement="left"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
            >
                <div className="mobile-menu">
                    <Link to="/profile">Quản lý tài khoản</Link>
                    <Divider />
                    <Link to="/history">Lịch sử mua hàng</Link>
                    <Divider />
                    <div onClick={handleLogout}>Đăng xuất</div>
                </div>
            </Drawer>

            <ManageAccount
                isModalOpen={openManageAccount}
                setIsModalOpen={setOpenManageAccount}
            />
        </>
    );
};

export default AppHeader;