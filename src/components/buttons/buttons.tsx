import styled from "@emotion/styled";
import { Button } from "@mui/material";
import { generalTheme } from "src/theme";

export const WarningButton = styled(Button)(({ disabled }) => ({
    backgroundColor: disabled ? 'gray' : '#000',
    color: 'white',
}));

export const GreenButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#BFE3B4',
    color: 'black',
}));

export const NormalButton = styled(Button)(({ disabled }) => ({
    backgroundColor: disabled ? 'gray' : generalTheme.palette.primary.main,
    color: 'white',
}));