import React, { createContext, useState, FC } from "react";

interface ForgotPasswordContextProps {
    hasVisitedForgotPassword: boolean;
    setHasVisitedForgotPassword: (visited: boolean) => void;
}

type TProps = {
    children: React.ReactNode;
}

export const ForgotPasswordContext = createContext<ForgotPasswordContextProps>({
    hasVisitedForgotPassword: false,
    setHasVisitedForgotPassword: () => { },
});

export const ForgotPasswordProvider: FC<TProps> = ({ children }) => {
    const [hasVisitedForgotPassword, setHasVisitedForgotPassword] = useState(false);

    return (
        <ForgotPasswordContext.Provider
            value={{ hasVisitedForgotPassword, setHasVisitedForgotPassword }}
        >
            {children}
        </ForgotPasswordContext.Provider>
    );
};