import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { parseJwt } from "src/infrastructure/helpers";

interface AuthState {
    token: string
}

const initialState: AuthState = {
    token: localStorage.getItem('token')!
}

export const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        authenticate: (state, action: PayloadAction<string>) => {
            state.token = action.payload
        },
        unauthenticate: state => {
            state.token = ''
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
        label: 'Vendas',
        route: '/vendas'
    },
    {
        label: 'Orçamentos',
        route: '/orcamentos'
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

export const selectToken = (state: RootState) => state.auth.token;
export const getAllRoutes = (_: RootState) => all_routes;
export const getAllowedRoutes = (state: RootState) => {
    const token = parseJwt(state.auth.token);
    if (!token) return [];

    const routes = token.is_admin 
    ?  all_routes.map(r => r.route) 
    : token.allowed_routes.split(',');

    return routes;
}

export default AuthSlice.reducer