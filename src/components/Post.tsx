import { type ReactNode, useEffect, useState } from "react";

import type { PostType } from "../interface";

import { useMainContext } from "../MainApp";

const PostPreview = ({ post }: { post: PostType }) => {
	const { handleSelectPost } = useMainContext();
	const previewUrl = post?.previewUrl ?? post?.sampleUrl ?? post.fileUrl;
	const ext = previewUrl.split(".").pop();
	const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
	const blacklist = ["https://cdn.donmai.us/images/flash-preview.png"];
	if (!isImage || blacklist.includes(previewUrl)) {
		return (
			<div
				className="bg-gray-500 aspect-square p-2 break-words text-white cursor-zoom-in overflow-y-scroll"
				onClick={() => handleSelectPost(post.id)}
			>
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
				alt={`${post.id}`}
				title={`url: ${post.fileUrl}\n\ntags: ${post.tags.join(" ")}`}
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
				title={`url: ${post.fileUrl}\n\ntags: ${post.tags.join(" ")}`}
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
				title={`url: ${post.fileUrl}\n\ntags: ${post.tags.join(" ")}`}
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
					className="w-full"
					data={post.fileUrl}
					type="application/x-shockwave-flash"
					title={`url: ${post.fileUrl}\n\ntags: ${post.tags.join(" ")}`}
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

export const Post = ({ post }: { post: PostType }) => {
	const { selectedPosts } = useMainContext();
	const isSelected = selectedPosts.includes(post.id);
	if (!isSelected) {
		return <PostPreview post={post} />;
	}
	const ext = post.fileUrl.split(".").pop();
	const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
	const isVideo = ["webm", "mp4"].includes(ext);
	const isSWF = ["swf"].includes(ext);
	if (isImage) {
		return <PostPicture post={post} />;
	}
	if (isVideo) {
		return <PostVideo post={post} />;
	}
	if (isSWF) {
		return <PostSWF post={post} />;
	}
	return <PostUnknown post={post} />;
};
