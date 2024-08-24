import { MailOutlined, GithubOutlined, InstagramOutlined } from "@ant-design/icons";

const Footer = () => {
    return (
        <footer className="h-20 dark:bg-customBlack bg-slate-100 flex flex-col items-center justify-center text-sm">
            <nav className="flex gap-4">
                <a href="mailto:96limshyun@gmail.com"><MailOutlined /><span className="ml-1">EMAIL</span></a>
                <a href="https://github.com/96limshyun"><GithubOutlined /><span className="ml-1">GITHUB</span></a>
                <a href="https://www.instagram.com/limshyun_/"><InstagramOutlined /><span className="ml-1">INSTAGRAM</span></a>
            </nav>
            <div className="mt-2 text-gray-600">© 2024 SeungHyun Lim. All rights reserved.</div>
        </footer>
    );
};

export default Footer;
