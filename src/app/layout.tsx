import "~/styles/globals.css";

import type { Metadata } from "next";

import { Manrope, Nunito } from "next/font/google";
import TRPCReactProvider from "~/trpc/trpc_react_provider";
import { Toaster } from "sonner";

const heading_font = Nunito({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  display: "swap",
});

const main_font = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-main",
  display: "swap",
});

export const metadata: Metadata = {
  title: "",
  description: "",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${main_font.variable} ${heading_font.variable} font-main`}
    >
      <body>
        <TRPCReactProvider>
          {children}
          <Toaster richColors />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
