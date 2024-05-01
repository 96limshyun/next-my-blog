import { Post } from "@/.contentlayer/generated";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export default function PostCard(post: Post): React.ReactElement {
    return (
        <div className="m-4 flex flex-col border-b-2 p-2">
            <time dateTime={post.date} className="text-xs text-gray-500 mb-3">
                {format(parseISO(post.date), "LLLL d, yyyy")}
            </time>
            <Link href={post.url} className="text-xl mb-1">
                {post.title}
            </Link>
            <Link href={post.url} className="text-lg mb-1 text-gray-600">
                {post.content}
            </Link>
        </div>
    );
}
