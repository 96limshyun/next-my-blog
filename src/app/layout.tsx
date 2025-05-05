import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { ThemeProvider } from "next-themes";
import 'prism-themes/themes/prism-one-dark.css';

const notoSansKr = Noto_Sans_KR({
    weight: ["500"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "LimSH Blog",
    description: "SeungHyun Lim의 블로그입니다.",
    icons: {
        icon: "/titleIcon.png",
    },
    verification: {
        google: "FIcxO7eiij2xhUy-83C8kKilyaQFW5Dj6dfnU3Yg0nw"
    }
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
    return (
        <html
            lang="ko"
            className={notoSansKr.className}
            suppressHydrationWarning
        >
            <body className="flex flex-col min-h-screen">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <Header />
                    <main className="flex-grow dark:bg-customBlack">{children}</main>
                    <Footer />
                </ThemeProvider>
            </body>
        </html>
    );
}
