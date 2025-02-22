import { Outlet } from "react-router-dom";
import AppHeader from "./components/layout/app.header";

const Layout = () => {
    return (
        <>
            {/* <AppHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            /> */}
            <AppHeader />
            {/* <Outlet context={[searchTerm, setSearchTerm]} /> */}
            <Outlet />
        </>
    )
}

export default Layout;