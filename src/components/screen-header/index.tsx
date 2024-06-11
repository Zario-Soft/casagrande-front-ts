import { Cached } from "@mui/icons-material"
import { IconButton } from "@mui/material"

interface ScreenHeaderProps {
    title: string
    onUpdateClick: () => void,
    hideUpdateButton?: boolean | undefined
}

export default function ScreenHeader({ title, onUpdateClick, hideUpdateButton }: ScreenHeaderProps) {
    return <header style={{
        textAlign: 'center'
    }}>
        <h2>{title}<IconButton color="primary" aria-label="Atualizar" component="span" onClick={onUpdateClick}>
            {!hideUpdateButton && <Cached />}
        </IconButton></h2>
    </header>
}