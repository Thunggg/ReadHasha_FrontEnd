import { createContext, useContext, useState } from "react";

interface IAppContext {
    isAuthenticated: boolean,
    setIsAuthenticated: (v: boolean) => void,
    setUser: (v: IUser) => void,
    user: IUser | null,
}

const CurrentAppContext = createContext<IAppContext | null>(null);

type TProps = {
    children: React.ReactNode
}

export const AppProvider = (props: TProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<IUser | null>(null);

    return (
        <CurrentAppContext.Provider value={{
            isAuthenticated, setIsAuthenticated, user, setUser
        }}>
            {props.children}
        </CurrentAppContext.Provider>
    );
};

export const useCurrentApp = () => {
    const currentUserContext = useContext(CurrentAppContext);

    if (!currentUserContext) {
        throw new Error(
            "useCurrentUser has to be used within <CurrentUserContext.Provider>"
        );
    }

    return currentUserContext;
};
