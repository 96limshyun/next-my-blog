import { allPosts } from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";
import PostCard from "@/src/components/PostCard/PostCard";

export default function PostsPage() {
    const posts = allPosts.sort((a, b) =>
        compareDesc(new Date(a.date), new Date(b.date))
    );

    return (
        <main className="max-w-screen-md flex flex-col px-10 m-auto">
            {posts.map((post) => (
                <PostCard key={post._id} {...post} />
            ))}
        </main>
    );
}
