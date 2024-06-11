import { FunctionComponent, ReactNode, createContext, useState } from 'react'
import { Loader } from '../components/loader';

interface LoadingProviderProps {
    children: ReactNode
}

interface providerValue {
    setIsLoading: (value: boolean) => void,
}

const defaultProviderValue: providerValue = {
    setIsLoading: (_: boolean) => { }
}

export const LoadingContext = createContext<providerValue>(defaultProviderValue);

export const LoadingProvider: FunctionComponent<LoadingProviderProps> = ({ children }) => {

    const [isLoading, setIsLoading] = useState(false);

    const value: providerValue = { setIsLoading };

    return (
        <LoadingContext.Provider value={value}>
            <Loader isLoading={isLoading} />
            {children}
        </LoadingContext.Provider>
    );
}