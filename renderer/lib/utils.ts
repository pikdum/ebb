export const isImage = (fileUrl: string) => {
	const ext = fileUrl.split(".").pop();
	return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
};
