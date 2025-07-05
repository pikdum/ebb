import { decode } from "html-entities";

import type { BooruPost } from "../lib/booru";
import { useMainContext } from "../lib/hooks/useMainContext";
import { isImage } from "../lib/utils";

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
			<button
				type="button"
				className="bg-gray-500 aspect-square p-2 break-words text-white cursor-zoom-in overflow-y-scroll text-left"
				onClick={() => handleSelectPost(post.id)}
			>
				<p className="font-semibold">{ext}</p>
				<code>{post.tags.map((e) => decode(e)).join(" ")}</code>
			</button>
		);
	}
	return (
		<button
			type="button"
			className="w-full aspect-square bg-gray-100 cursor-zoom-in"
			onClick={() => handleSelectPost(post.id)}
		>
			<img
				className="object-cover w-full aspect-square"
				src={previewUrl}
				loading="lazy"
				alt={`${post.id} (Preview)`}
			/>
		</button>
	);
};
