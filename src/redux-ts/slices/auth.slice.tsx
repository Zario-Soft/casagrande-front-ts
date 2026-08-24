import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { GetUserInfo, UserInfo } from "src/infrastructure/helpers";

interface AuthState {
    isAuthenticated: boolean,
    userInfo: UserInfo | null,
}

const initialState: AuthState = {
    isAuthenticated: GetUserInfo() !== null,
    userInfo: GetUserInfo(),
}

export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authenticate: (state, action: PayloadAction<UserInfo>) => {
            state.isAuthenticated = true
            state.userInfo = action.payload
        },
        unauthenticate: state => {
            state.isAuthenticated = false
            state.userInfo = null
        }
    }
})

export const { authenticate, unauthenticate } = AuthSlice.actions

const all_routes = [
    {
        label: 'Clientes',
        route: '/clientes'
    },
    {
        label: 'Produtos',
        route: '/produtos'
    },
    {
        label: 'Orçamentos',
        route: '/orcamentos'
    },
    {
        label: 'Vendas',
        route: '/vendas'
    },
    {
        label: 'Calendário',
        route: '/calendario'
    },
    {
        label: 'Configurações',
        route: '/configuracoes'
    }
]

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const getAllRoutes = (_: RootState) => all_routes;
export const getAllowedRoutes = (state: RootState) => {
    const userInfo = state.auth.userInfo;
    if (!userInfo) return [];

    const routes = userInfo.is_admin
    ?  all_routes.map(r => r.route)
    : (userInfo.allowed_routes || '').split(',').filter((r: string) => r !== '' && r !== undefined);

    return routes;
}

export default AuthSlice.reducer