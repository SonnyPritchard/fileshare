import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Private Connect",
  description: "Private device access for teams"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
          {children}
        </div>
      </body>
    </html>
  );
}
