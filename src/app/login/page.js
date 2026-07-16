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
        bgcolor: "#f8fafc",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          mx: 2,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          borderRadius: 4,
          color: "#0f172a",
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
                color: "#0f172a",
                letterSpacing: "-0.025em",
              }}
            >
              BP Convenience
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Please sign in to access your dashboard
            </Typography>
          </Box>

          {/* Feedback alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
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
                  color: "#0f172a",
                  bgcolor: "#f8fafc",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "#217DF0" },
                },
                "& .MuiInputLabel-root": { color: "#64748b" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#217DF0" },
                "& input": {
                  color: "#0f172a !important",
                  WebkitTextFillColor: "#0f172a !important",
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: "#64748b" }}>
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
                  color: "#0f172a",
                  bgcolor: "#f8fafc",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "#217DF0" },
                },
                "& .MuiInputLabel-root": { color: "#64748b" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#217DF0" },
                "& input": {
                  color: "#0f172a !important",
                  WebkitTextFillColor: "#0f172a !important",
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: "#64748b" }}>
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: "#64748b" }}
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
                background: "#0f172a",
                boxShadow: "none",
                "&:hover": {
                  background: "#1e293b",
                },
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "10px",
                textTransform: "none",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Don&apos;t have an account?{" "}
              <Button
                onClick={() => router.push("/signup")}
                sx={{
                  color: "#217DF0",
                  textTransform: "none",
                  fontWeight: 600,
                  p: 0,
                  minWidth: "auto",
                  "&:hover": { color: "#1e70d6" },
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
