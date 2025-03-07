import { useEffect } from "react";

import { useMainContext } from "../MainApp";
import type { BooruPost } from "../lib/booru";

export const PostSWF = ({ post }: { post: BooruPost }) => {
	const { handleSelectPost, headerHeight, selectedPost, scrollToId } =
		useMainContext();

	useEffect(() => {
		if (selectedPost === post.id) {
			scrollToId(post.id);
		}
	}, []);

	return (
		<div className="col-span-full text-center">
			<div id={post.id} style={{ height: `calc(100vh - ${headerHeight}px)` }}>
				<object
					title={post.id}
					className="w-full"
					data={post.fileUrl}
					type="application/x-shockwave-flash"
					style={{ height: `calc(100vh - ${headerHeight}px)` }}
				/>
			</div>
			<button
				type="button"
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-2 rounded-sm"
				onClick={() => handleSelectPost(post.id)}
			>
				Close {post.id}
			</button>
		</div>
	);
};
