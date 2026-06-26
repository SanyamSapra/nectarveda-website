import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NectarVeda",
  description: "Premium Ayurvedic Products for Healthy Living",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Providers>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
        </Providers>
      </body>
    </html>
  );
}
