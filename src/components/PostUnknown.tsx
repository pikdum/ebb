import { decode } from "html-entities";

import { useMainContext } from "../MainApp";
import type { BooruPost } from "../lib/booru";

export const PostUnknown = ({ post }: { post: BooruPost }) => {
	const { handleSelectPost } = useMainContext();
	return (
		<div
			className="bg-gray-500 aspect-square p-2 break-word text-white cursor-zoom-out overflow-y-scroll"
			onClick={() => handleSelectPost(post.id)}
		>
			<p className="font-semibold">Unknown File Type</p>
			<p>{post.id}</p>
			<p>{post.fileUrl}</p>
			<p>{post.tags.map((e) => decode(e)).join(" ")}</p>
		</div>
	);
};
