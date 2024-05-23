import classNames from "classnames";
import { type ReactNode, useEffect, useState } from "react";

import { useMainContext } from "../MainApp";
import type { PostType } from "../interface";

const isImage = (fileUrl: string) => {
	const ext = fileUrl.split(".").pop();
	return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
};

const isVideo = (fileUrl: string) => {
	const ext = fileUrl.split(".").pop();
	return ["webm", "mp4"].includes(ext);
};

const isSWF = (fileUrl: string) => {
	const ext = fileUrl.split(".").pop();
	return ["swf"].includes(ext);
};

const PostPreview = ({ post }: { post: PostType }) => {
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
				<code>{post.tags.join(" ")}</code>
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

const PostSkeleton = ({
	post,
	loading,
	children,
}: {
	post: PostType;
	loading: boolean;
	children: ReactNode;
}) => {
	const { headerHeight } = useMainContext();
	// TODO: move this into context
	const calculateRenderSize = (imageWidth: number, imageHeight: number) => {
		const windowWidth = document.documentElement.clientWidth;
		const windowHeight = window.innerHeight - headerHeight;

		const imageRatio = imageWidth / imageHeight;

		const maxWidth = windowWidth;
		const maxHeight = windowHeight;

		let renderWidth = maxWidth;
		let renderHeight = renderWidth / imageRatio;

		if (renderHeight > maxHeight) {
			renderHeight = maxHeight;
			renderWidth = renderHeight * imageRatio;
		}

		renderWidth = Math.floor(renderWidth);
		renderHeight = Math.floor(renderHeight);

		return { width: renderWidth, height: renderHeight };
	};

	const { width, height } = calculateRenderSize(post.width, post.height);

	return (
		<div className="col-span-full">
			<div
				id={post.id}
				className="bg-gray-100 inline-block"
				style={{
					width: loading ? width : "auto",
					height: loading ? height : "auto",
				}}
			>
				{children}
			</div>
		</div>
	);
};

const PostPicture = ({ post }: { post: PostType }) => {
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
			<img
				className="max-w-full cursor-zoom-out"
				style={{ maxHeight: `calc(100vh - ${headerHeight}px)` }}
				src={post.fileUrl}
				alt={`${post.id}`}
				onClick={() => handleSelectPost(post.id)}
				onLoad={() => {
					setLoading(false);
				}}
			/>
		</PostSkeleton>
	);
};

const PostVideo = ({ post }: { post: PostType }) => {
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

const PostSWF = ({ post }: { post: PostType }) => {
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
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 mt-2 rounded"
				onClick={() => handleSelectPost(post.id)}
			>
				Close {post.id}
			</button>
		</div>
	);
};

const PostUnknown = ({ post }: { post: PostType }) => {
	const { handleSelectPost } = useMainContext();
	return (
		<div
			className="bg-gray-500 aspect-square p-2 break-word text-white cursor-zoom-out overflow-y-scroll"
			onClick={() => handleSelectPost(post.id)}
		>
			<p className="font-semibold">Unknown File Type</p>
			<p>{post.id}</p>
			<p>{post.fileUrl}</p>
			<p>{post.tags.join(" ")}</p>
		</div>
	);
};

const PostDetails = ({ post }: { post: PostType }) => {
	const { query, tempQuery, setTempQuery } = useMainContext();

	const handleTagClick = (tag: string) => {
		if (!tempQuery.split(" ").includes(tag)) {
			setTempQuery((tempQuery) =>
				[...tempQuery.split(" "), tag].filter((e) => e).join(" "),
			);
			return;
		}
		setTempQuery((tempQuery) =>
			tempQuery
				.split(" ")
				.filter((e) => e && e !== tag)
				.join(" "),
		);
	};

	return (
		<div className="px-2 break-words text-white col-span-full text-center">
			{post.tags?.map((tag) => (
				<button
					type="button"
					key={tag}
					onClick={() => handleTagClick(tag)}
					className={classNames(
						"bg-blue-500 hover:bg-blue-700 text-white text-xs font-semibold p-1 px-2 m-1 rounded",
						{
							"bg-blue-700": query.split(" ").includes(tag),
							"bg-purple-500":
								tempQuery.split(" ").includes(tag) &&
								!query.split(" ").includes(tag),
							"bg-red-500":
								!tempQuery.split(" ").includes(tag) &&
								query.split(" ").includes(tag),
						},
					)}
				>
					{tag}
				</button>
			))}
		</div>
	);
};

export const Post = ({ post }: { post: PostType }) => {
	const { selectedPosts } = useMainContext();
	const isSelected = selectedPosts.includes(post.id);
	if (!isSelected) {
		return <PostPreview post={post} />;
	}
	if (isImage(post.fileUrl)) {
		return (
			<>
				<PostPicture post={post} />
				<PostDetails post={post} />
			</>
		);
	}
	if (isVideo(post.fileUrl)) {
		return (
			<>
				<PostVideo post={post} />
				<PostDetails post={post} />
			</>
		);
	}
	if (isSWF(post.fileUrl)) {
		return (
			<>
				<PostSWF post={post} />
				<PostDetails post={post} />
			</>
		);
	}
	return <PostUnknown post={post} />;
};
