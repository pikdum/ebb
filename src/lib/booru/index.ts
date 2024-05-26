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
}) => {
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
}) => {
	const provider = getBooruProvider(site);
	const request = provider.buildTagRequest({
		query,
	});
	const response = await request;
	if (response.ok) {
		return response.json();
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
