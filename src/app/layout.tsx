import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant"
});

import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Sri Sai Home Appliances and Furnitures | Mysuru",
  description: "Your one-stop destination for premium home appliances and elegant furniture in Mysuru. Best prices and official brand warranty.",
  icons: {
    icon: [
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-192.png",
    apple: "/apple-icon.png",
    other: [
      { rel: "apple-touch-icon", url: "/apple-icon.png" },
    ],
  },
  verification: {
    google: "google7e30e0407a14f1c1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${cormorant.variable}`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
