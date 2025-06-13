import { useEffect, useState } from "react";

import type { BooruPost } from "../lib/booru";
import { useMainContext } from "../lib/hooks/useMainContext";
import { PostSkeleton } from "./PostSkeleton";

export const PostVideo = ({ post }: { post: BooruPost }) => {
	const [loading, setLoading] = useState(true);
	const { handleSelectPost, selectedPost, scrollToId, headerHeight } =
		useMainContext();

	useEffect(() => {
		if (selectedPost === post.id) {
			scrollToId(post.id);
		}
	}, []);

	return (
		<PostSkeleton post={post} loading={loading}>
			<video
				className="max-w-full cursor-zoom-out"
				style={{ maxHeight: `calc(100vh - ${headerHeight}px)` }}
				src={post.fileUrl}
				onClick={(e) => {
					e.preventDefault();
					handleSelectPost(post.id);
				}}
				onCanPlay={() => {
					setLoading(false);
				}}
				autoPlay
				controls
				loop
			/>
		</PostSkeleton>
	);
};
