import Link from "next/link";
import ThemeSwitch from "../ThemeSwitch/ThemeSwith";

const pages = [
    {
        name: "posts",
        href: "/posts",
    },
];

const Header = () => {
    return (
        <header className="sticky top-0 z-10 h-16 flex flex-row justify-around items-center border-b dark:border-white dark:bg-customBlack bg-white shadow-md">
            <div>
                <Link href="/" className="font-bold text-2xl font-mono">Limsh.io</Link>
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
