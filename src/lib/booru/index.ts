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
	rating: string;
};

export type BooruTag = {
	label: string;
	value: string;
	color: string;
	postCount?: number;
};

const getBooruProvider = (site: BooruSite) => {
	switch (site) {
		case "gelbooru":
			return Gelbooru;
	}
};

export const getPosts = async ({
	site,
	tags,
	limit,
	page,
	rating,
}: {
	site: BooruSite;
	tags: string;
	limit: number;
	page: number;
	rating?: any;
}): Promise<{ posts: BooruPost[]; hasNextPage: boolean }> => {
	const provider = getBooruProvider(site);
	const request = provider.buildPostRequest({
		tags,
		limit,
		page,
		rating,
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
}): Promise<BooruTag[]> => {
	const provider = getBooruProvider(site);
	const request = provider.buildTagRequest({
		query,
	});
	const response = await request;
	if (response.ok) {
		const data = await response.json();
		return provider.transformTagData(data);
	}
	throw new Error(`${response.status} ${response.statusText}`);
};

export const getRatings = (site: BooruSite): string[] => {
	return getBooruProvider(site).ratings;
};

export const getSites = (): {
	label: string;
	value: BooruSite;
	icon: string;
}[] => {
	return [
		{
			label: "Gelbooru",
			value: "gelbooru",
			icon: "https://gelbooru.com/layout/gelbooru-logo.svg",
		},
	];
};
