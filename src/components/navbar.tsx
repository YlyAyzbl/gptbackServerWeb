// Navbar.tsx
import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Box,
    Divider,
    Collapse,
    ListItemButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { APP_NAME, MENU_ITEMS, MenuItem } from '../global/config';

const Navbar: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<{ [key: string]: boolean }>({});

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const handleMenuClick = (menuKey: string) => {
        setOpenMenu((prevOpen) => ({ ...prevOpen, [menuKey]: !prevOpen[menuKey] }));
    };

    const handleMenuItemClick = (path: string) => {
        window.location.href = path;
    };

    const renderMenuItems = (items: MenuItem[], level = 0) => {
        return items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenu[item.key] || false;
            const IconComponent = item.icon;

            return (
                <React.Fragment key={item.key}>
                    <ListItem disablePadding>
                        <ListItemButton
                            sx={{ pl: 2 + level * 2 }}
                            onClick={() => {
                                if (hasChildren) {
                                    handleMenuClick(item.key);
                                } else if (item.path) {
                                    handleMenuItemClick(item.path);
                                }
                            }}
                        >
                            {IconComponent && (
                                <ListItemIcon>
                                    {React.createElement(IconComponent, { sx: { color: '#ffffff' } })}
                                </ListItemIcon>
                            )}
                            <ListItemText primary={item.name} sx={{ color: '#ffffff' }} />
                            {hasChildren ? (isOpen ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItemButton>
                    </ListItem>
                    {hasChildren && (
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {renderMenuItems(item.children!, level + 1)}
                            </List>
                        </Collapse>
                    )}
                </React.Fragment>
            );
        });
    };

    const drawerContent = (
        <Box
            sx={{ overflow: 'auto' }}
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <Typography sx={{ pb: 8 }}>
                {/* Placeholder */}
            </Typography>
            <Typography variant="h6" sx={{ padding: theme.spacing(2), textAlign: 'center', color: '#ffffff' }}>
                Navigation
            </Typography>
            <Divider />
            <List>
                {renderMenuItems(MENU_ITEMS)}
            </List>
        </Box>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="fixed"
                color="primary"
                sx={{ zIndex: theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        sx={{ mr: 2 }}
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(!drawerOpen)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontFamily: 'Roboto, sans-serif',
                            fontWeight: 'bold',
                            color: '#ffffff',
                        }}
                    >
                        {APP_NAME}
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: isMobile ? '60vw' : '30vw',
                        maxWidth: 300,
                        backgroundColor: '#2E3B55',
                        color: '#ffffff',
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Navbar;
