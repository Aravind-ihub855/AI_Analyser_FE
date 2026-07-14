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
} from "@mui/material";
import { useRouter } from "next/navigation";

const BotNavbar = () => {
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
        router.push("/organisation/login");
    };

    const isRestrictedUser = typeof window !== 'undefined' && localStorage.getItem("is_bot_user") === "true";

    return (
        <AppBar
            position="static"
            sx={(theme) => ({
                background: `linear-gradient(
        180deg,
        ${theme.palette.primary.main} 0%,
        ${theme.palette.primary.main} 100%
      )`,
                boxShadow: "none",
                zIndex: 1201,
            })}
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
                        alignItems: "center"
                    }}
                >
                    <Typography
                        color="menu.text.normal"
                        variant="h6"
                        fontSize={16}
                        fontWeight={600}
                        sx={{ opacity: 0.9, whiteSpace: "nowrap" }}
                    >
                        AI Assistant
                    </Typography>
                </Box>

                {/* Right Side - Avatar */}
                <Box display="flex" alignItems="center" sx={{ zIndex: 1 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            color: "menu.text.default",
                            bgcolor: "menu.text.normal",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: 2,
                            fontWeight: 600,
                            cursor: "pointer",
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
