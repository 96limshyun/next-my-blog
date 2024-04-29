import Link from "next/link";

const pages = [
    {
        name: 'post',
        href: '/post'
    },
    {
        name: 'project',
        href: '/project'
    },
]

const Header = () => {
    return <div>
        {pages.map(page => (
            <Link href={page.href} key={page.href}>
                <span>{page.name}</span>
            </Link>
        ))}
    </div>
}

export default Header