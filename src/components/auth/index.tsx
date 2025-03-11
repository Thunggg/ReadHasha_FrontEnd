import { Button, Result } from "antd";
import { useCurrentApp } from "../context/app.context";
import { Link, useLocation } from "react-router-dom";

interface IProps {
    children: React.ReactNode
}

const ProtectedRoute = (props: IProps) => {
    const { isAuthenticated, user } = useCurrentApp();
    const location = useLocation();

    if (isAuthenticated === false) {
        return (
            <Result
                status="404"
                title="404"
                subTitle="Trang của bạn muốn truy cập không tồn tại!"
                extra={<Button type="primary">
                    <Link to="/login">Đăng nhập</Link>
                </Button>}
            />
        )
    }

    const isAdminRoute = location.pathname.includes("admin");
    if (isAuthenticated === true && isAdminRoute === true && user?.role !== 0) {
        return (
            <Result
                status="403"
                title="403"
                subTitle="Bạn không có quyền hạn để truy cập trang này!"
                extra={<Button type="primary">
                    <Link to="/">Trang chủ</Link>
                </Button>}
            />
        )
    }

    return (
        <>
            {props.children}
        </>
    )


}

export default ProtectedRoute;