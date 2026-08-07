import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { THEME_COOKIE_NAME } from "@/lib/theme-mode/cookie";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata = {
  title: "The Artisans — verified skill, on demand",
  description: "Verified people and payments. Protected payments.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1526" },
  ],
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const dark = cookieStore.get(THEME_COOKIE_NAME)?.value === "dark";

  return (
    <html lang="en" className={`${inter.variable}${dark ? " dark" : ""}`}>
      <body className="pb-20">
        <Nav initialDark={dark} />
        {children}
      </body>
    </html>
  );
}
