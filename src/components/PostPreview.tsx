import { decode } from "html-entities";

import { useMainContext } from "../MainApp";
import type { BooruPost } from "../lib/booru";
import { isImage } from "./Post";

export const PostPreview = ({ post }: { post: BooruPost }) => {
	const { handleSelectPost } = useMainContext();
	const blacklist = [
		"https://cdn.donmai.us/images/flash-preview.png",
		"https://static1.e621.net/images/download-preview.png",
	];
	const previewUrl = [post?.sampleUrl, post?.previewUrl, post.fileUrl]
		.filter(Boolean)
		.filter((url) => !blacklist.includes(url))
		.find(isImage);
	if (!previewUrl) {
		const ext = post.fileUrl.split(".").pop();
		return (
			<div
				className="bg-gray-500 aspect-square p-2 break-words text-white cursor-zoom-in overflow-y-scroll"
				onClick={() => handleSelectPost(post.id)}
			>
				<p className="font-semibold">{ext}</p>
				<code>{post.tags.map((e) => decode(e)).join(" ")}</code>
			</div>
		);
	}
	return (
		<div className="w-full aspect-square bg-gray-100">
			<img
				className="object-cover w-full aspect-square cursor-zoom-in"
				src={previewUrl}
				loading="lazy"
				alt={`${post.id} (Preview)`}
				onClick={() => handleSelectPost(post.id)}
			/>
		</div>
	);
};
