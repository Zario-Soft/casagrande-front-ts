import React, { ReactNode } from 'react'
import { authenticate, unauthenticate } from '../redux-ts';
import { useAppDispatch } from '../redux-ts/hooks';
import { IsAuthorized, UserInfo } from 'src/infrastructure/helpers';
import LoginService from 'src/features/login/login.service';

interface AuthProviderProps {
    children: ReactNode
}

interface providerValue {
    isAuthenticated: () => boolean,
    isAuthorized: (route: string) => boolean,
    onLogin: (userInfo: UserInfo) => void,
    onLogout: () => void,
}

const defaultProviderValue: providerValue = {
    isAuthenticated: () => false,
    isAuthorized: (_: string) => false,
    onLogin: (_: UserInfo) => console.log(''),
    onLogout: () => console.log('')
}

export const AuthContext = React.createContext<providerValue>(defaultProviderValue);

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({ children }) => {

    const dispatch = useAppDispatch();
    const loginService = new LoginService();

    const onLogin = (userInfo: UserInfo) => {
        dispatch(authenticate(userInfo));

        localStorage.setItem('userinfo', JSON.stringify(userInfo));
    }
    const onLogout = async () => {
        try {
            await loginService.doLogout();
        } finally {
            dispatch(unauthenticate());

            localStorage.removeItem('userinfo');
        }
    };

    const providerValues: providerValue = {
        isAuthenticated: () => localStorage.getItem('userinfo') !== null,
        isAuthorized: IsAuthorized,
        onLogin,
        onLogout
    }

    return (
        <AuthContext.Provider value={providerValues}>
            {children}
        </AuthContext.Provider>
    );
}