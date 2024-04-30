import { MoonFilled, SunOutlined } from "@ant-design/icons";
import Link from "next/link";
import react, { useState } from "react";

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
        <header className="sticky top-0 z-10 h-20 flex flex-row justify-around items-center border-b-4 bg-white">
            <div>
                <Link href="/" className="font-bold text-2xl">SeungHyun Lim</Link>
            </div>
            <nav>
                {pages.map((page) => (
                    <Link href={page.href} key={page.href} className="p-4">
                        <span className="inline-block font-bold text-xl text-gray-500 hover:text-black">{page.name}</span>
                    </Link>
                ))}
            </nav>
        </header>
    );
};

export default Header;
