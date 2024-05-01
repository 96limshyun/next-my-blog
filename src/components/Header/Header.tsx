import { MoonFilled, SunOutlined } from "@ant-design/icons";
import Link from "next/link";
import react, { useState } from "react";
import ThemeSwitch from "../ThemeSwitch/ThemeSwith";

const pages = [
    {
        name: "posts",
        href: "/posts",
    },
    {
        name: "project",
        href: "/project",
    },
];

const Header = () => {
    return (
        <header className="sticky top-0 z-10 h-20 flex flex-row justify-around items-center border-b-4 dark:bg-customBlack bg-white">
            <div>
                <Link href="/" className="font-bold text-xl md:text-2xl">SeungHyun Lim</Link>
            </div>
            <nav className="flex">
                {pages.map((page) => (
                    <Link href={page.href} key={page.href} className="p-3">
                        <span className="inline-block font-bold text-xl">{page.name}</span>
                    </Link>
                ))}
                <span className="flex items-center text-2xl p-4"><ThemeSwitch/></span>
            </nav>
        </header>
    );
};

export default Header;
