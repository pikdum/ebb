import { Gelbooru } from "./gelbooru";

export type BooruSite = "gelbooru";

export type BooruPost = {
	id: string;
	tags: string[];
	fileUrl: string;
	previewUrl: string;
	sampleUrl: string | null;
	height: number;
	width: number;
};

export const getPosts = async ({
	site,
	tags,
	limit,
	page,
}: {
	site: BooruSite;
	tags: string;
	limit: number;
	page: number;
}) => {
	let provider: any;
	if (site === "gelbooru") {
		provider = Gelbooru;
	}
	const request = provider.buildPostRequest({
		tags,
		limit,
		page,
	});
	const response = await request;
	if (response.ok) {
		const data = await response.json();
		return provider.transformPostData(data);
	}
	throw new Error(`${response.status} ${response.statusText}`);
};

export const getTags = async ({
	site,
	query,
}: {
	site: BooruSite;
	query: string;
}) => {
	let provider: any;
	if (site === "gelbooru") {
		provider = Gelbooru;
	}
	const request = provider.buildTagRequest({
		query,
	});
	const response = await request;
	if (response.ok) {
		return response.json();
	}
	throw new Error(`${response.status} ${response.statusText}`);
};
