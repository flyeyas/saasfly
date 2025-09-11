import { Inter as FontSans } from "next/font/google";
import localFont from "next/font/local";

// Configure Inter font with better error handling
export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: ["system-ui", "arial", "sans-serif"],
  display: "swap",
  preload: true,
  // Add adjustFontFallback to prevent layout shift
  adjustFontFallback: false,
});

// Font files can be colocated inside of `pages`
export const fontHeading = localFont({
  src: "../styles/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
  fallback: ["system-ui", "arial", "sans-serif"],
  display: "swap",
});

// Fallback font configuration for when Google Fonts fail
export const fallbackFontSans = {
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  variable: "--font-sans",
};