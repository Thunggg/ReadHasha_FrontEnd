import { fetchAccountAPI } from "@/services/api";
import { createContext, useContext, useEffect, useState } from "react";
import { PacmanLoader } from "react-spinners";

interface IAppContext {
    isAuthenticated: boolean,
    setIsAuthenticated: (v: boolean) => void,
    setUser: (v: IUser | null) => void,
    user: IUser | null,
    isAppLoading: boolean,
    setIsAppLoading: (v: boolean) => void
    carts: ICart[],
    setCarts: (v: ICart[]) => void
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
    children: React.ReactNode
}

export const AppProvider = (props: TProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<IUser | null>(null);
    const [isAppLoading, setIsAppLoading] = useState<boolean>(false);
    const [carts, setCarts] = useState<ICart[]>([]);

    useEffect(() => {
        const fetchAccount = async () => {
            setIsAppLoading(true);

            try {
                const res = await fetchAccountAPI();
                console.log(">>>> res", res);

                if (res.data) {
                    // Lưu thông tin người dùng
                    setUser(res.data);
                    setIsAuthenticated(true);

                    // Kiểm tra nếu có cartCollection trong dữ liệu trả về
                    if (res.data.cartCollection && Array.isArray(res.data.cartCollection)) {
                        // Chuyển đổi dữ liệu từ cartCollection sang định dạng ICart
                        const cartsFromDB = res.data.cartCollection.map(item => ({
                            id: item.bookID.bookID,
                            quantity: item.quantity,
                            detail: item.bookID
                        }));

                        // Cập nhật giỏ hàng từ database
                        setCarts(cartsFromDB);

                        // Đồng bộ giỏ hàng vào localStorage để sử dụng offline
                        localStorage.setItem("carts", JSON.stringify(cartsFromDB));
                    } else {
                        // Nếu không có cartCollection, đặt giỏ hàng trống
                        setCarts([]);
                        localStorage.setItem("carts", JSON.stringify([]));
                    }
                } else {
                    // Nếu không đăng nhập, kiểm tra giỏ hàng trong localStorage
                    const carts = localStorage.getItem("carts");
                    if (carts) {
                        setCarts(JSON.parse(carts));
                    }
                }
            } catch (error) {
                console.error("Error fetching account:", error);
                // Nếu có lỗi, vẫn thử lấy giỏ hàng từ localStorage
                const carts = localStorage.getItem("carts");
                if (carts) {
                    setCarts(JSON.parse(carts));
                }
            }

            // Dừng lại 1 giây trước khi tắt loading
            setTimeout(() => {
                setIsAppLoading(false);
            }, 1000);
        };

        fetchAccount();
    }, []);

    return (
        <>
            {isAppLoading === false ?
                <CurrentAppContext.Provider value={{
                    isAuthenticated, user, setIsAuthenticated, setUser, isAppLoading, setIsAppLoading, carts, setCarts
                }
                }>
                    {props.children}
                </CurrentAppContext.Provider>
                :
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}>
                    <PacmanLoader
                        size={50}
                        color="#6EC2F7"
                    />
                </div>
            }
        </>
    );
};

export const useCurrentApp = () => {
    const currentAppContext = useContext(CurrentAppContext);

    if (!currentAppContext) {
        throw new Error(
            "useCurrentApp must be used within <CurrentAppContext.Provider>"
        );
    }

    return currentAppContext;
};
