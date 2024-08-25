import { allPosts } from "@/.contentlayer/generated";
import { notFound } from "next/navigation";
import Comment from "@/src/components/Comments/Comments";
import ReactMarkdown from 'react-markdown';

export default function Page({ params }: { params: { slug: string } }) {
    const post = allPosts.find((post) => post._raw.flattenedPath === params.slug);

    if (!post) notFound();

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
            <ReactMarkdown className="dark:text-white prose dark:prose-invert">{post.body.raw}</ReactMarkdown> 
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
