import Link from "next/link";
import Image from "next/image";

const projects = [
    {
        title: "News-Stand SPA",
        content: "네이버 메인 페이지의 언론사 별 기사 탭 클론 프로젝트!",
        IMG: "/newsStand.png",
        skills: ["JavaScript", "React", "express", "MongoDB"],
        link: "https://github.com/96limshyun/fe-newsstand-react",
    },
];

const ProjectPage = () => {
    return (
        <main className="max-w-screen-md flex flex-col px-10 mt-10 mx-auto items-center justify-center">
            {projects.map((data, idx) => (
                <Link href={data.link} key={idx}>
                    <section className="flex flex-col p-6 m-3 border-2 rounded-md">
                        <Image
                            src={data.IMG}
                            alt="Image"
                            width={300}
                            height={210}
                            priority={true}
                            objectFit="none"
                            quality={100}
                            className="w-full h-1/2 object-center rounded-t-4"
                        ></Image>
                        <div className="w-full h-1/2 flex flex-col gap-1 pl-3">
                            <div className="text-xl font-bold my-4">📰 {data.title}</div>
                            <div className="mb-4">{data.content}</div>
                            <div className="flex gap-2">
                                {data.skills.map((skill, idx) => (
                                    <div className="rounded-lg py-1 px-2 text-sm bg-customSkillColor text-white" key={idx}>{skill}</div>
                                ))}
                            </div>
                        </div>
                    </section>
                </Link>
            ))}
        </main>
    );
};

export default ProjectPage;
