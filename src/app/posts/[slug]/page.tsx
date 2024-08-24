import { allPosts } from "@/.contentlayer/generated";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";
import Comment from "@/src/components/Comments/Comments";

const mdxComponents: MDXComponents = {
    a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
    ul: (props) => <ul className="m-0 p-0 list-none" {...props} />,
    li: (props) => <li className="m-0 p-0" {...props} />,
    ol: (props) => <ol className="m-0 " {...props} />,
    h1: (props) => <h1 className="m-0 dark:text-white" {...props} />,
    h2: (props) => <h2 className="dark:text-white" {...props} />,
    h3: (props) => <h3 className="dark:text-white" {...props} />,
    h4: (props) => <h4 className="dark:text-white" {...props} />,
    code: ({ className, children }) => (
        <code className={`dark:bg-gray-800 dark:text-white ${className}`}>
            {children}
        </code>
    ),
    // p: (props) => <p className="text-white dark:text-white" {...props} />,
};


export default function Page({ params }: { params: { slug: string } }) {
    const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);

    if (!post) {
        notFound();
    }

    const MDXContent = useMDXComponent(post.body.code);

    return (
        <article className="max-w-screen-md flex flex-col px-10 m-auto prose dark:text-white">
            <div className="mt-8">
                <time
                    dateTime={post.date}
                    className="text-sm text-gray-600 dark:text-gray-300"
                >
                    {new Intl.DateTimeFormat("en-US").format(new Date(post.date))}
                </time>
                <h1 className="text-3xl font-bold dark:text-white mt-3">
                    {post.title}
                </h1>
            </div>
            <hr className="border-t-2 border-gray-200 mt-4 mb-6" />
            <MDXContent components={mdxComponents} />
            <div className="mt-20">
                <Comment />
            </div>
        </article>
    );
}

export async function generateStaticParams() {
    return allPosts.map((post) => ({
        slug: post._raw.flattenedPath,
    }));
}
