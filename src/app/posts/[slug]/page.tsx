import { allPosts } from "@/.contentlayer/generated";
import { notFound } from "next/navigation";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";
import Comment from "@/src/components/Comments/Comments";

const mdxComponents: MDXComponents = {
    a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
};

export default function Page({ params }: { params: { slug: string } }) {
    const post = allPosts.find(
        (post) => post._raw.flattenedPath === params.slug
    );
    if (!post) notFound();

    const MDXContent = useMDXComponent(post.body.code);

    return (
        <article className="max-w-screen-md flex flex-col px-10 m-auto prose">
            <div className="mt-8 text-center">
                <time
                    dateTime={post.date}
                    className="mb-1 text-xs text-gray-600"
                >
                    {new Intl.DateTimeFormat("en-US").format(
                        new Date(post.date)
                    )}
                </time>
                <h1 className="text-3xl font-bold">{post.title}</h1>
            </div>
            <MDXContent components={mdxComponents} />
            <Comment/>
        </article>
    );
}
