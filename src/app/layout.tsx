import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "PingSociety | دورهمی بچه های Tech",
  description:
    "کامیونیتی تخصصی برای علاقهمندان و فعالان حوزه فناوری. هدف ما ایجاد بستری برای شبکهسازی، به اشتراکگذاری تجربهها و کشف فرصتهای جدید در جامعهی تکنولوژی است.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
