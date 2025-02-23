import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { fetchAccountAPI } from "./services/api";
import { useCurrentApp } from "./components/context/app.context";
import { PacmanLoader } from "react-spinners";
import AppHeader from "./Layout/client/app.header";

const Layout = () => {
    return (
        <div>
            <AppHeader />
            <Outlet />
        </div>
    )
}

export default Layout;