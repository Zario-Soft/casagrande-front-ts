import { ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

interface SideBarItemProps {
    open: boolean,
    path: string,
    text: string,
    icon: any,
    divider?:boolean
}

export function SideBarItem(props: SideBarItemProps) {
    const { open, path, text, divider } = props;

    const navigate = useNavigate();

    return <>
        <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                }}
                onClick={async () => await navigate(path)}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                    }}
                >
                    {props.icon}
                </ListItemIcon>
                <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
        </ListItem>
        {(divider ?? false) && <Divider />}
    </>
}