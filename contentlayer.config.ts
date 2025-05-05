import { defineDocumentType, makeSource } from "contentlayer/source-files";
import rehypePrism from 'rehype-prism-plus';

export const Post = defineDocumentType(() => ({
    name: "Post",
    filePathPattern: `**/*.md`,
    contentType: "markdown",
    fields: {
        title: {
            type: "string",
            required: true,
        },
        date: {
            type: "date",
            required: true,
        },
        category: {
            type: "string",
            required: true,
        },
        content: {
            type: "string",
            required: true,
        },
    },
    computedFields: {
        url: {
            type: "string",
            resolve: (post) => `/posts/${post._raw.flattenedPath}`,
        },
    },
}));

export default makeSource({
    contentDirPath: "posts",
    documentTypes: [Post],
    markdown: {
        rehypePlugins: [rehypePrism as any],
    }
});
