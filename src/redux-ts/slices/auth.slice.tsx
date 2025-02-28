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

export const selectToken = (state: RootState) => state.auth.token;
export const getAllowedRoutes = (state: RootState) => parseJwt(state.auth.token).allowedRoutes;

export default AuthSlice.reducer