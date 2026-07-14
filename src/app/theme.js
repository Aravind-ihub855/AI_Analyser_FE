import { Margin } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#217DF0",
      navbar: "#217DF0",
    },
    custom: {
      greenGradient:
        "linear-gradient(90deg, #779B2A 0%, #9AC757 53%, #C4ED53 100%)",
    },
    secondary: {
      main: "#A7E1FA",
    },
    background: {
      default: "#F5F5F5",
    },
    text: {
      primary: "#1E293B",
    },
    menu: {
      active: "#E9E9E9",
      hover: "#F5F5F5",
      text: {
        active: "#217DF0",
        normal: "white",
        disabled: "black",
        default: "#333",
      },
      collapse: {
        background: "#217DF0",
        active: "#217DF0",
      },
    },
    // ✅ Add a common hover setting
    hover: {
      background: "#1a6ad4",
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
