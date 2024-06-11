import { Stack, Avatar } from '@mui/material';
import { ContextMenu } from '../context-menu';
import { useState } from 'react';

const avatarSx = { cursor: 'pointer' }

export interface SidebarFooterProps {
    open: boolean
}

export function SidebarFooter(props: SidebarFooterProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();
    const [showContextMenu, setShowContextMenu] = useState(false);

    const fullname = localStorage.getItem('fullname') ?? 'Usuário';

    return <Stack direction="row" spacing={1}>
        <ContextMenu anchorEl={anchorEl!} open={showContextMenu} onClose={() => setShowContextMenu(false)} />
        <Avatar
            sx={avatarSx}
            onClick={(e: any) => {
                setAnchorEl(e.currentTarget)
                setShowContextMenu(true)
            }}
        >{fullname[0]}</Avatar>

        {props.open && <h5
            style={{ marginTop: 10, cursor: 'pointer' }}
            onClick={(e) => {
                setAnchorEl(e.currentTarget)
                setShowContextMenu(true)
            }}>{fullname}</h5>}
    </Stack>
}