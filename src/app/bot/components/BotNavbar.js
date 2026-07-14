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
                borderBottom: "1px solid #e2e8f0",
                boxShadow: "none",
                zIndex: 1201,
            }}
        >
            <Toolbar
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: "6px", position: "relative" }}
            >
                {/* Left Side placeholder to balance the layout for centering */}
                <Box sx={{ width: 48, zIndex: 1 }} />

                {/* Center Title - Absolutely positioned to ensure true centering */}
                <Box
                    sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5
                    }}
                >
                    <Typography
                        color="text.primary"
                        variant="h6"
                        fontSize={15}
                        fontWeight={600}
                        sx={{ whiteSpace: "nowrap", letterSpacing: "-0.01em" }}
                    >
                        AI Assistant
                    </Typography>
                    {currentUser?.role === 'store manager' && (
                        <Chip
                            icon={<StoreIcon sx={{ fontSize: '12px !important' }} />}
                            label={`Viewing Store: ${storeName || currentUser.storeId || 'N/A'}`}
                            size="small"
                            sx={{
                                fontSize: '11px',
                                bgcolor: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #e2e8f0',
                                height: '24px',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#475569' }
                            }}
                        />
                    )}
                    {currentUser?.role === 'vendor manager' && (
                        <Chip
                            icon={<PublicIcon sx={{ fontSize: '12px !important' }} />}
                            label={`Region: ${currentUser.region || 'N/A'}`}
                            size="small"
                            sx={{
                                fontSize: '11px',
                                bgcolor: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #e2e8f0',
                                height: '24px',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#475569' }
                            }}
                        />
                    )}
                    {currentUser?.role === 'super admin' && (
                        <Chip
                            icon={<PublicIcon sx={{ fontSize: '12px !important' }} />}
                            label="Super Admin"
                            size="small"
                            sx={{
                                fontSize: '11px',
                                bgcolor: '#f1f5f9',
                                color: '#334155',
                                border: '1px solid #e2e8f0',
                                height: '24px',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#475569' }
                            }}
                        />
                    )}
                </Box>

                {/* Right Side - Avatar */}
                <Box display="flex" alignItems="center" sx={{ zIndex: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            color: "#ffffff",
                            bgcolor: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: 2,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "13px"
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
                            horizontal: "left",
                        }}
                        PaperProps={{
                            sx: { mt: 1, minWidth: 150, borderRadius: 2 },
                        }}
                    >
                        <List dense>
                            {!isRestrictedUser && (
                                <ListItemButton onClick={() => { handleProfileClose(); router.push("/home"); }}>
                                    <ListItemText primary="Go to Dashboard" />
                                </ListItemButton>
                            )}
                            <ListItemButton onClick={handleLogout}>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </List>
                    </Popover>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default BotNavbar;
