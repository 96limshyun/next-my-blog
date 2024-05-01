import { allPosts } from "@/.contentlayer/generated";
import { compareDesc } from "date-fns";
import { MailOutlined, GithubOutlined, InstagramOutlined } from "@ant-design/icons";
import PostCard from "../components/PostCard/PostCard";
import Image from "next/image";

export default function Home() {
  const posts = allPosts.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date))).slice(0, 5);
    return (
        <main className="max-w-screen-md flex flex-col px-10 m-auto">
            <section className="text-left w-full">
                <h1 className="font-bold text-4xl py-10">👨🏻‍💻 SeungHyun Lim</h1>
                <div className="flex flex-row items-center justify-evenly mx-auto">
                    <Image
                        src="/MyIMG.JPG"
                        alt="My Image"
                        width={300}
                        height={210}
                        priority={true}
                        className="rounded-xl"
                        style={{ width: "auto", height: "auto" }}
                    ></Image>
                    <div className="flex flex-col gap-6">
                        <h2 className="font-bold text-xl">
                            학습하는 Frontend-Developer
                        </h2>
                        <p className="text-gray-600">
                            성장하기 위해 노력합니다.
                            <br />
                            새로운 기술을 학습하고 <br />
                            문제를 해결해 나가는 것을 좋아합니다.
                        </p>
                        <div className="flex flex-row gap-4">
                            <a href="mailto:96limshyun@gmail.com">
                                <MailOutlined />
                                <span className="ml-1">EMAIL</span>
                            </a>
                            <a href="https://github.com/96limshyun">
                                <GithubOutlined />
                                <span className="ml-1">GITHUB</span>
                            </a>
                            <a href="https://www.instagram.com/limshyun_/">
                                <InstagramOutlined />
                                <span className="ml-1">INSTAGRAM</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            <section className="text-left w-full">
                <h1 className="font-bold text-4xl py-10">📋 Recent Posts</h1>
                <main className="w-full mx-auto">
                    {posts.map((post) => (
                        <PostCard key={post._id} {...post} />
                    ))}
                </main>
            </section>
        </main>
    );
}