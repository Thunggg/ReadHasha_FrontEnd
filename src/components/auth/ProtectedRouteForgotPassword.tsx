import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { ForgotPasswordContext } from "@/components/context/ForgotPassword.context";

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRouteForgotPassword: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { hasVisitedForgotPassword } = useContext(ForgotPasswordContext);

    if (!hasVisitedForgotPassword) {
        // Nếu chưa truy cập /forgot-password, chuyển hướng về trang đó
        return <Navigate to="/forgot-password" replace />;
    }

    return children;
};

export default ProtectedRouteForgotPassword;
