"use client";

import React, { useState } from "react";
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
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined, PersonOutline } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import apiService from "../../services/axiosService";
import config from "../../services/config";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiService({
        method: "post",
        url: "/auth/signup",
        data: { name, email, password },
        customBaseUrl: config.FINANCE_AI_Base_url,
      });

      // Save success message to local storage so login page can display it
      localStorage.setItem("signup_success_msg", "Registration successful! Please log in.");
      router.push("/login");
    } catch (err) {
      setError(err?.detail || err?.message || "Registration failed. Please try again.");
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
              Create your account to start analyzing
            </Typography>
          </Box>

          {/* Feedback alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSignup}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
                    <PersonOutline />
                  </InputAdornment>
                ),
              }}
            />

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
              label="Password (min 6 characters)"
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#475569" }}>
              Already have an account?{" "}
              <Button
                onClick={() => router.push("/login")}
                sx={{
                  color: "#217DF0",
                  textTransform: "none",
                  fontWeight: 600,
                  p: 0,
                  minWidth: "auto",
                  "&:hover": { color: "#1e70d6" },
                }}
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
