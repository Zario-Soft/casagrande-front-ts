
import { styled, Theme, CSSObject } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import { Avatar } from '@mui/material';
//import ExtensionIcon from '@mui/icons-material/Extension';
//import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ExtensionIcon from '@mui/icons-material/Extension';
import RedeemIcon from '@mui/icons-material/Redeem';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
//import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { SidebarFooter } from './sidebar-footer';
import logo from '../../assets/logo.png'
import { SideBarItem } from './sidebar-item';
import { AppDispatch } from '../../redux-ts';
import { useAppDispatch, useAppSelector } from '../../redux-ts/hooks';
import { change, getSidebarStatus } from '../../redux-ts/slices/sidebar.slice';
import { pageRoutes } from '../../routes';

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden'
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export function SideBar(props: React.HTMLAttributes<HTMLDivElement>,) {
    const dispatch: AppDispatch = useAppDispatch();
    const open: boolean = useAppSelector(getSidebarStatus);

    const { children } = props;

    const navigate = useNavigate();

    const handleNavigation = async (path: string) => {
        await navigate(path);
    }

    const handleOpen = async () => {
        dispatch(change(!open))
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Drawer variant="permanent" open={open}>
                <DrawerHeader>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Avatar sx={{ m: 1, cursor: 'pointer' }} src={logo} onClick={async () => await handleNavigation('/')} />
                        <IconButton onClick={handleOpen}>
                            {!open ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </div>
                </DrawerHeader>
                <Divider />
                <List>
                    {/* <SideBarItem
                        icon={<HomeIcon />}
                        open={open}
                        path={'/'}
                        text={'Inicial'}
                        divider
                    /> */}
                    <SideBarItem
                        icon={<AccessibilityIcon />}
                        open={open}
                        path={pageRoutes.CLIENTES}
                        text={'Clientes'}
                        divider
                    />

                    <SideBarItem
                        icon={<RedeemIcon />}
                        open={open}
                        path={pageRoutes.PRODUTOS}
                        text={'Produtos'}
                        divider
                    />
                    <SideBarItem
                        icon={<AddShoppingCartIcon />}
                        open={open}
                        path={pageRoutes.ORCAMENTOS}
                        text={'Orçamentos'}
                        divider
                    />
                    <SideBarItem
                        icon={<MonetizationOnIcon />}
                        open={open}
                        path={pageRoutes.VENDAS}
                        text={'Vendas'}
                        divider
                    />
                    <SideBarItem
                        icon={<DateRangeIcon />}
                        open={open}
                        path={pageRoutes.CALENDARIO}
                        text={'Calendário'}
                        divider
                    />
                    {/* <SideBarItem
                        icon={<PrecisionManufacturingIcon />}
                        open={open}
                        path={pageRoutes.PRODUCAO}
                        text={'Produção'}
                        divider
                    /> */}
                    <SideBarItem
                        icon={<ExtensionIcon />}
                        open={open}
                        path={pageRoutes.CONFIGURACOES}
                        text={'Configurações'}
                        divider
                    />
                </List>

                <List style={{ marginTop: `auto` }} >
                    <ListItem>
                        <SidebarFooter open={open} />
                    </ListItem>
                </List>
            </Drawer>
            {children}
        </Box>
    );
}