import type { Metadata } from "next";
import { Sedgwick_Ave_Display, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const sedgwick = Sedgwick_Ave_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sedgwick",
});

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Xtreme Stickers - Custom Stickers & Merch",
  description: "Get your custom stickers and merch with Xtreme Stickers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sedgwick.variable} ${poppins.variable} font-sedgwick antialiased`}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
