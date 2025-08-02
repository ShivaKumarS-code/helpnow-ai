import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HelpNow Ai",
  description: "Don't Panic. Just Say it. HelpNow Ai Listens.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon.png?v=2"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme")||"system",e=window.matchMedia("(prefers-color-scheme: dark)").matches,r="dark"===t||"system"===t&&e?"dark":"light",o=document.documentElement;o.setAttribute("data-theme",r),o.classList.toggle("dark","dark"===r),o.style.setProperty("--background","dark"===r?"#0a0a0a":"#ffffff"),o.style.setProperty("--foreground","dark"===r?"#ededed":"#171717"),o.style.backgroundColor="dark"===r?"#0a0a0a":"#ffffff",o.style.colorScheme=r}catch(e){}})();`,
          }}
        />
        <style>{`
          html[data-theme="dark"] {
            background-color: #0a0a0a;
            color-scheme: dark;
          }
          html[data-theme="light"] {
            background-color: #ffffff;
            color-scheme: light;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
