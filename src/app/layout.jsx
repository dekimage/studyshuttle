"use client";
import { Inter as FontSans, Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ReusableLayout from "./_components/ReusableLayout";
import { ThemeProvider } from "@/theme-provider";
import { Header } from "../Components/Header";
import { Footer } from "../Components/Footer";
import { usePathname } from "next/navigation";

export const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weights: [400, 500, 600, 700, 800, 900],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Define your route-specific conditions here
  const showReusableLayout = ![
    "/login",
    "/signup",
    "/profesori",
    "/skolarina",
    "/osnovno",
    "/sredno",
    "/univerzitet",
  ].includes(pathname); // Example: Hide layout on login and register routes
  const showHeaderFooter = ![
    "/pocetna",
    "/professor-admin",
    "/professors",
    "/analytics",
    "/profile",
    "/schedule",
  ].includes(pathname); // Example: Hide header and footer on specific routes

  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen w-full bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system">
          {showReusableLayout ? (
            <ReusableLayout>
              {showHeaderFooter && <Header />}
              {children}
              {showHeaderFooter && <Footer />}
            </ReusableLayout>
          ) : (
            <>
              {showHeaderFooter && <Header />}
              {children}
              {showHeaderFooter && <Footer />}
            </>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
