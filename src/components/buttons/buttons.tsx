import styled from "@emotion/styled";
import { Button } from "@mui/material";

export const WarningButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#E3735E',
    color: 'white'
}));

export const GreenButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#BFE3B4',
    color: 'black',
}));

export const NormalButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#6488ea',
    color: 'white',
}));