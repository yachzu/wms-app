import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/providers/react-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SpeedInsights } from "@vercel/speed-insights/next"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "WMS - Warehouse Management System",
  description: "Professional warehouse management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            {children}
            <SpeedInsights />
            <Toaster />
          </ReactQueryProvider>
        </ThemeProvider>
        <footer className="fixed bottom-2 left-2 right-2">
          <a href="https://github.com/yachzu/wms-app" target="_blank" rel="noopener noreferrer">GitHub</a>
          <p>© {new Date().getFullYear()} WMS - Warehouse Management System</p>
        </footer>
      </body>
    </html>
  );
}

