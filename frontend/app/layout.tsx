import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Walia Batteries Admin",
  description: "Management dashboard for Walia Batteries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className={`${inter.className} bg-[#f4f7fe] text-gray-900`}>
        <div className="flex h-screen overflow-hidden">
          
          {/* Left Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Sidebar />
          </aside>

          {/* Right Main Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            
            {/* Top Header */}
            <header className="h-20 flex-shrink-0 bg-[#f4f7fe] px-8 py-4">
              <Header />
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto px-8 pb-8">
              {children}
            </main>

          </div>
        </div>
      </body>
    </html>
  );
}