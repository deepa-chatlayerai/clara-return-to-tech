import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Clara — Your return to tech, on your terms",
  description:
    "Clara helps women returning to tech after a career break find jobs, upskill, track applications, and connect with others in the same journey.",
  keywords: [
    "women in tech",
    "career returner",
    "job search",
    "Belgium",
    "expat",
    "career break",
  ],
  openGraph: {
    title: "Clara",
    description: "Your return to tech, on your terms",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1C1917",
                color: "#FAFAF8",
                borderRadius: "8px",
                fontSize: "14px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
