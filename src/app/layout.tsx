import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/SidebarContext";

export const metadata: Metadata = {
  title: "InkStream Docs",
  description: "Aggregated documentation across all workspaces and projects",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="inkstream-body">
        <SidebarProvider>{children}</SidebarProvider>
      </body>
    </html>
  );
}
