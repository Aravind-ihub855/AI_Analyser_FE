"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import apiService from "../../services/axiosService";
import config from "../../services/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to bot
  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/bot");
    }
    
    // Check for success message from signup redirect
    const signupSuccess = localStorage.getItem("signup_success_msg");
    if (signupSuccess) {
      setSuccess(signupSuccess);
      localStorage.removeItem("signup_success_msg");
    }
  }, [router]);

  const validateForm = () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService({
        method: "post",
        url: "/auth/login",
        data: { email, password },
        customBaseUrl: config.FINANCE_AI_Base_url,
      });

      const { token, user } = response.data;
      
      // Store auth credentials in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("user_name", user.name || "User");
      localStorage.setItem("user_email", user.email);
      // Store full user profile for persona display in ChatPanel
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        router.push("/bot");
      }, 1000);
    } catch (err) {
      setError(err?.detail || err?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Blur Spheres */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(33, 125, 240, 0.15) 0%, rgba(33, 125, 240, 0) 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167, 225, 250, 0.1) 0%, rgba(167, 225, 250, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          mx: 2,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          borderRadius: 4,
          color: "#fff",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                mb: 1,
                background: "linear-gradient(90deg, #A7E1FA 0%, #217DF0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI Assistant
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Please sign in to access your dashboard
            </Typography>
          </Box>

          {/* Feedback alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, bgcolor: "rgba(239, 68, 68, 0.1)", color: "#fca5a5" }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3, bgcolor: "rgba(34, 197, 94, 0.1)", color: "#86efac" }}>
              {success}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#217DF0" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.6)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#217DF0" },
                "& input": {
                  WebkitTextFillColor: "#fff !important",
                  color: "#fff !important",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    <EmailOutlined />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
                  "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
                  "&.Mui-focused fieldset": { borderColor: "#217DF0" },
                },
                "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.6)" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#217DF0" },
                "& input": {
                  WebkitTextFillColor: "#fff !important",
                  color: "#fff !important",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "rgba(255, 255, 255, 0.6)" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                background: "linear-gradient(90deg, #217DF0 0%, #0F172A 180%)",
                boxShadow: "0 4px 14px rgba(33, 125, 240, 0.4)",
                "&:hover": {
                  background: "linear-gradient(90deg, #1e70d6 0%, #0F172A 180%)",
                },
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: 2,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.6)" }}>
              Don&apos;t have an account?{" "}
              <Button
                onClick={() => router.push("/signup")}
                sx={{
                  color: "#A7E1FA",
                  textTransform: "none",
                  fontWeight: 600,
                  p: 0,
                  minWidth: "auto",
                  "&:hover": { color: "#217DF0" },
                }}
              >
                Create Account
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
