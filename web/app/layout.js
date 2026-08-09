import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { THEME_COOKIE_NAME } from "@/lib/theme-mode/cookie";
import { getSession } from "@/lib/auth/session";

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
  // Verified server-side so Nav renders the right chrome on first paint —
  // otherwise the client-side session fetch briefly shows logged-out nav
  // (Log in/Sign up) before flipping to Messages/Dashboard/account icon.
  const session = await getSession();

  return (
    <html lang="en" className={`${inter.variable}${dark ? " dark" : ""}`}>
      <body className="pb-20">
        <Nav initialDark={dark} initialLoggedIn={Boolean(session)} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
