import React, { ReactNode } from 'react'
import { authenticate, unauthenticate } from '../redux-ts';
import { useAppDispatch } from '../redux-ts/hooks';
import { IsAuthorized } from 'src/infrastructure/helpers';

interface AuthProviderProps {
    children: ReactNode
}

interface providerValue {
    getToken: () => string | null,
    isAuthenticated: () => boolean,
    isAuthorized: (route: string) => boolean,
    onLogin: (token: string, fullname?: string) => void,
    onLogout: () => void,
}

const defaultProviderValue: providerValue = {
    getToken: () => '',
    isAuthenticated: () => false,
    isAuthorized: (_: string) => false,
    onLogin: (_: string, _f?: string) => console.log(''),
    onLogout: () => console.log('')
}

export const AuthContext = React.createContext<providerValue>(defaultProviderValue);

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({ children }) => {

    const dispatch = useAppDispatch();

    const onLogin = (token: string, fullname?: string) => {
        dispatch(authenticate(token));

        localStorage.setItem('token', token);

        if (fullname)
            localStorage.setItem('fullname', fullname);
    }
    const onLogout = () => {
        dispatch(unauthenticate());

        localStorage.removeItem('token')
        localStorage.removeItem('fullname');
    };

    const providerValues: providerValue = {
        getToken: () => localStorage.getItem('token'),
        isAuthenticated: () => localStorage.getItem('token') !== null,
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