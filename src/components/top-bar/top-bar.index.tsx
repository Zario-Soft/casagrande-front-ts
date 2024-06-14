import { AppBar, Toolbar, Typography, useTheme } from "@mui/material";

interface TopBarProps {
  title?: string
}

export default function TopBar({ title } : TopBarProps) {
  const theme = useTheme();
  
  return (<>
    <AppBar style={{
      backgroundColor: theme.palette.primary.main
    }}>
      <Toolbar style={{
      display: 'flex',
      justifyContent: 'center'
    }}>
        <Typography variant="h6" component="div">
          {title ?? 'Casagrande Meias'}
        </Typography>
      </Toolbar>
    </AppBar>
    <Toolbar />
  </>);
}