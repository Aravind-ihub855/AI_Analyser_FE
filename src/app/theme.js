import { Margin } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f172a",
      navbar: "#ffffff",
    },
    custom: {
      greenGradient:
        "linear-gradient(90deg, #334155 0%, #475569 53%, #64748b 100%)",
    },
    secondary: {
      main: "#f1f5f9",
    },
    background: {
      default: "#f8fafc",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    menu: {
      active: "#f1f5f9",
      hover: "#f8fafc",
      text: {
        active: "#0f172a",
        normal: "#475569",
        disabled: "#94a3b8",
        default: "#475569",
      },
      collapse: {
        background: "#0f172a",
        active: "#0f172a",
      },
    },
    // ✅ Add a common hover setting
    hover: {
      background: "#1e293b",
      text: "white",
      borderRadius: "5px",
      Margin: "10px",
    },
  },
  typography: {
    fontFamily: 'var(--font-poppins), "Inter", "Source Sans Pro", Helvetica, Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "uppercase",
        },
      },
    },
  },
});

export default theme;
