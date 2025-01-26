import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <>
            {/* <AppHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            /> */}
            {/* <Outlet context={[searchTerm, setSearchTerm]} /> */}
            <Outlet />
        </>
    )
}

export default Layout;