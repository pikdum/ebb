import { useMainContext } from "../MainApp";
import type { BooruPost } from "../lib/booru";
import { PostDetails } from "./PostDetails";
import { PostPicture } from "./PostPicture";
import { PostPreview } from "./PostPreview";
import { PostSWF } from "./PostSWF";
import { PostUnknown } from "./PostUnknown";
import { PostVideo } from "./PostVideo";

export const isImage = (fileUrl: string) => {
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

export const Post = ({ post }: { post: BooruPost }) => {
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
