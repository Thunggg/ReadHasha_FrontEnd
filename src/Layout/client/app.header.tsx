import { useState, useEffect } from 'react';
import { FaReact } from 'react-icons/fa';
import { VscSearchFuzzy } from 'react-icons/vsc';
import { Divider, Drawer, AutoComplete, Input } from 'antd';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import './app.header.scss';
import { Link } from 'react-router-dom';
import { useCurrentApp } from 'components/context/app.context';
import { logoutAPI, getBookAPI } from '@/services/api';

interface IProps {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
}

const AppHeader = (props: IProps) => {
    const [openDrawer, setOpenDrawer] = useState(false);
    // Lưu gợi ý tìm kiếm dưới dạng mảng IBook
    const [suggestions, setSuggestions] = useState<IBook[]>([]);
    const { isAuthenticated, user, setUser, setIsAuthenticated } = useCurrentApp();
    const navigate = useNavigate();

    // Hàm fetch gợi ý tìm kiếm (không giới hạn bản ghi)
    const fetchSuggestions = async (searchText: string) => {
        try {
            const res = await getBookAPI(`mainText=${encodeURIComponent(searchText)}&pageSize=100`);
            console.log(">>>>>> OK", res);
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
            localStorage.removeItem("access_token");
        }
    };

    // Menu dropdown tài khoản
    const items = [
        ...(user?.role === 0 ? [{
            label: <Link to='/admin'>Trang quản trị</Link>,
            key: 'admin',
        }] : []),
        {
            label: <Link to="/profile">Quản lý tài khoản</Link>,
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
        </>
    );
};

export default AppHeader;