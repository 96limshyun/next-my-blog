"use client";

import { allPosts } from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";
import PostCard from "@/src/components/PostCard/PostCard";
import { useState } from "react";
import CategorySelector from "@/src/components/CategorySelector/CategorySelector";

export default function PostsPage() {
    const initialCategory = allPosts.sort((a, b) =>
        compareDesc(new Date(a.date), new Date(b.date))
    );
    const [curCategory, setCategory] = useState(initialCategory);

    const switchCategory = (selectCategory: string) => {
        const newCategory = allPosts.filter(data => data.category.includes(selectCategory))
        setCategory(newCategory)
    }
    return (
        <>
            <main className="max-w-screen-md flex flex-col px-10 m-auto">
            <CategorySelector switchCategory={switchCategory}/>
                {curCategory.map((post) => (
                    <PostCard key={post._id} {...post} />
                ))}
            </main>
        </>
    );
}
