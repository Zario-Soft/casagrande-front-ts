import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Logout from '@mui/icons-material/Logout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pageRoutes } from '../../routes';

export interface CtxMenuProps {
    anchorEl?: HTMLElement,
    open: boolean,
    onClose?: () => void
}

export function ContextMenu(props: CtxMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(props.anchorEl!);
    const [open, setOpen] = React.useState(false)

    const navigate = useNavigate();

    const handleLogout = () => {        
        navigate(pageRoutes.LOGIN);
        handleClose();
    }
    
    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false)

        if (props.onClose)
            props.onClose();
    };

    useEffect(() => {
        setAnchorEl(props.anchorEl!)
        setOpen(props.open)
    }, [props.open, props.anchorEl])

    return (
        <React.Fragment>
            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
            >
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}