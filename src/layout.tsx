import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchAccountAPI } from "./services/api";
import { useCurrentApp } from "./components/context/app.context";
import { PacmanLoader } from "react-spinners";
import AppHeader from "./Layout/client/app.header";

const Layout = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    return (
        <div>
            <AppHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <Outlet context={[searchTerm, setSearchTerm]} />
        </div>
    )
}

export default Layout;