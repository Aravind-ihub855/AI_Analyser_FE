"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    IconButton,
    Typography,
    AppBar,
    Toolbar,
    Popover,
    ListItemButton,
    List,
    ListItemText,
    Chip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import StoreIcon from '@mui/icons-material/Store';
import PublicIcon from '@mui/icons-material/Public';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const BotNavbar = ({ currentUser, storeName }) => {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        let storedName = localStorage.getItem("user_name");
        setUserName(storedName || "User");
    }, []);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
        setProfileOpen(true);
    };

    const handleProfileClose = () => {
        setAnchorEl(null);
        setProfileOpen(false);
    };

    const handleLogout = () => {
        localStorage.clear();
        handleProfileClose();
        router.push("/login");
    };

    const isRestrictedUser = typeof window !== 'undefined' && localStorage.getItem("is_bot_user") === "true";

    return (
        <AppBar
            position="static"
            sx={{
                bgcolor: "#ffffff",
                borderBottom: "1px solid #f1f5f9",
                boxShadow: "none",
                zIndex: 1201,
            }}
        >
            <Toolbar
                sx={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center", 
                    px: 3,
                    minHeight: "60px !important",
                }}
            >
                {/* Left Side: Logo & Store Info */}
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {/* Logo & Brand Block */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.2)',
                        }}>
                            <StoreIcon sx={{ color: '#ffffff', fontSize: '20px' }} />
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
                                BP Convenience
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                Retail Operations
                            </Typography>
                        </Box>
                    </Box>

                    {/* Separator Divider */}
                    {(currentUser?.role === 'store manager' || currentUser?.role === 'vendor manager' || currentUser?.role === 'super admin') && (
                        <Box sx={{ width: '1px', height: '24px', bgcolor: '#e2e8f0', mx: 2.5 }} />
                    )}

                    {/* Metadata Header Info */}
                    {currentUser?.role === 'store manager' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '6px',
                                bgcolor: '#f0fdf4',
                                color: '#166534',
                            }}>
                                <StoreIcon sx={{ fontSize: '14px' }} />
                            </Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', letterSpacing: '-0.01em' }}>
                                {storeName || currentUser.storeId || 'N/A'}
                            </Typography>
                        </Box>
                    )}

                    {currentUser?.role === 'vendor manager' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '6px',
                                bgcolor: '#f0fdf4',
                                color: '#166534',
                            }}>
                                <PublicIcon sx={{ fontSize: '14px' }} />
                            </Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', letterSpacing: '-0.01em' }}>
                                Region: {currentUser.region || 'N/A'}
                            </Typography>
                        </Box>
                    )}

                    {currentUser?.role === 'super admin' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 24,
                                height: 24,
                                borderRadius: '6px',
                                bgcolor: '#f0fdf4',
                                color: '#166534',
                            }}>
                                <PublicIcon sx={{ fontSize: '14px' }} />
                            </Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#334155', letterSpacing: '-0.01em' }}>
                                Super Admin Mode
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Right Side - Avatar & Dropdown */}
                <Box display="flex" alignItems="center">
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            color: "#ffffff",
                            bgcolor: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "13px",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                                transform: "scale(1.05)",
                                bgcolor: "#1e293b",
                            }
                        }}
                        onClick={handleAvatarClick}
                    >
                        {userName.slice(0, 1).toUpperCase()}
                    </Box>

                    <Popover
                        open={profileOpen}
                        anchorEl={anchorEl}
                        onClose={handleProfileClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        PaperProps={{
                            sx: { 
                                mt: 1.5, 
                                minWidth: 160, 
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                border: '1px solid #f1f5f9'
                            },
                        }}
                    >
                        <List dense sx={{ p: 1 }}>
                            {!isRestrictedUser && (
                                <ListItemButton 
                                    onClick={() => { handleProfileClose(); router.push("/home"); }}
                                    sx={{ borderRadius: '8px', mb: 0.5 }}
                                >
                                    {/* <ListItemText primary="Go to Dashboard" primaryTypographyProps={{ fontSize: '13px', fontWeight: 500 }} /> */}
                                </ListItemButton>
                            )}
                            <ListItemButton 
                                onClick={handleLogout}
                                sx={{ 
                                    borderRadius: '8px', 
                                    color: '#ef4444',
                                    '&:hover': { bgcolor: '#fef2f2' }
                                }}
                            >
                                <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '13px', fontWeight: 600 }} />
                            </ListItemButton>
                        </List>
                    </Popover>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default BotNavbar;
