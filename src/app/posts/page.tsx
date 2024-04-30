import { allPosts } from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";
import PostCard from "@/src/components/PostCard/PostCard";

export default function PostsPage() {
    const posts = allPosts.sort((a, b) =>
        compareDesc(new Date(a.date), new Date(b.date))
    );

    return (
        <main className="mx-auto max-w-5xl ">
            {posts.map((post) => (
                <PostCard key={post._id} {...post} />
            ))}
        </main>
    );
}
