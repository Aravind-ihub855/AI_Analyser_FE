"use client";

import { Box, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Poppins } from "next/font/google";
import "../styles/globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={poppins.variable}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
            <Box sx={{ flexGrow: 1, overflow: "hidden", height: "100%", width: "100%" }}>
              {children}
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
