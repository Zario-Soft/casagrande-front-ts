import { CircularProgress } from "@mui/material";

export default function CircularLoader(props: any) {
    return (<CircularProgress
        variant="indeterminate"
        disableShrink
        style={{
            color: '#1a90ff',
            animationDuration: '550ms',
            left: 0
        }}
        size={40}
        thickness={4}
        {...props} />)
    }