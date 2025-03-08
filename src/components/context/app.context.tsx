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

            const res = await fetchAccountAPI();
            const carts = localStorage.getItem("carts");
            if (res.data) {
                setUser(res.data);
                setIsAuthenticated(true);
                if (carts) {
                    setCarts(JSON.parse(carts))
                }
            }
            // Dừng lại 2 giây trước khi tắt loading
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
