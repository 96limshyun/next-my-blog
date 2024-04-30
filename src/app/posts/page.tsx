import { allPosts } from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";
import PostCard from "@/src/components/PostCard/PostCard";

export default function PostsPage() {
    const posts = allPosts.sort((a, b) =>
        compareDesc(new Date(a.date), new Date(b.date))
    );

    return (
        <main className="w-2/4 mx-auto">
            {posts.map((post) => (
                <PostCard key={post._id} {...post} />
            ))}
        </main>
    );
}
