import { Inter as FontSans, Montserrat } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { themes } from "../util/config";
import { cn } from "@/lib/utils";
import ReusableLayout from "./_components/ReusableLayout";
import { ThemeProvider } from "@/theme-provider";
import { Header } from "../Components/Header";
import { Footer } from "../Components/Footer";

export const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weights: [400, 500, 600, 700, 800, 900],
});

export default function RootLayout({ children }) {
  return (
    // <ClerkProvider>
    <html lang="en">
      <body
        className={cn(
          "min-h-screen w-full bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          {/* <ReusableLayout> */}
          <Header />
          {children}
          <Footer />

          {/* </ReusableLayout> */}
        </ThemeProvider>
      </body>
    </html>
    // </ClerkProvider>
  );
}
