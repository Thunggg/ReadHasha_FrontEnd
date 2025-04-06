import { Outlet } from "react-router-dom";
import { useState } from "react";
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