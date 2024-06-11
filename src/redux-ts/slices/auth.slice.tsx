import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

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

export default AuthSlice.reducer