import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface SidebarState {
    open: boolean
}

const initialState: SidebarState = {
    open: false
}

export const SidebarSlice = createSlice({
    name: 'sidebar',
    initialState,
    reducers: {
        change: (state, action: PayloadAction<boolean>) => {
            state.open = action.payload
        }
    }
})

export const { change } = SidebarSlice.actions

export const getSidebarStatus = (state: RootState) => state.sidebar.open;

export default SidebarSlice.reducer