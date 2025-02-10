import { Outlet } from "react-router-dom";

const RegisterLayout = () => {
    return (
        <div className="register-container">
            <Outlet />
        </div>
    );
};

export default RegisterLayout;
