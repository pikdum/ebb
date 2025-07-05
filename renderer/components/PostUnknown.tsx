import { decode } from "html-entities";

import type { BooruPost } from "../lib/booru";
import { useMainContext } from "../lib/hooks/useMainContext";

export const PostUnknown = ({ post }: { post: BooruPost }) => {
	const { handleSelectPost } = useMainContext();
	return (
		<button
			type="button"
			className="bg-gray-500 aspect-square p-2 break-word text-white cursor-zoom-out overflow-y-scroll text-left"
			onClick={() => handleSelectPost(post.id)}
		>
			<p className="font-semibold">Unknown File Type</p>
			<p>{post.id}</p>
			<p>{post.fileUrl}</p>
			<p>{post.tags.map((e) => decode(e)).join(" ")}</p>
		</button>
	);
};
