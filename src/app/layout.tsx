import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Electronic Scoring & Screening System",
  description: "Modern electronic scoring and screening system for educational institutions with intelligent admission processing.",
  keywords: ["scoring", "screening", "admission", "education", "examination", "UTME", "O'Level"],
  authors: [{ name: "Screening System Team" }],
  openGraph: {
    title: "Electronic Scoring & Screening System",
    description: "Modern electronic scoring and screening system for educational institutions",
    url: "https://yourschool.edu",
    siteName: "Screening System",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Electronic Scoring & Screening System",
    description: "Modern electronic scoring and screening system for educational institutions",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
