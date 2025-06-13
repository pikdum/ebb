import type { ReactNode } from "react";

import type { BooruPost } from "../lib/booru";
import { useMainContext } from "../lib/hooks/useMainContext";

const calculateRenderSize = (
	headerHeight: number,
	imageWidth: number,
	imageHeight: number,
) => {
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

export const PostSkeleton = ({
	post,
	loading,
	children,
}: {
	post: BooruPost;
	loading: boolean;
	children: ReactNode;
}) => {
	const { headerHeight } = useMainContext();

	const { width, height } = calculateRenderSize(
		headerHeight,
		post.width,
		post.height,
	);

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
