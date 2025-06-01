import { Danbooru } from "./danbooru";
import { e621 } from "./e621";
import { Gelbooru } from "./gelbooru";
import { Rule34 } from "./rule34";

export type BooruSite = "gelbooru" | "danbooru" | "rule34" | "e621";

export type BooruPost = {
	id: string;
	tags: string[];
	fileUrl: string;
	previewUrl: string;
	sampleUrl: string | null;
	postView: string;
	height: number;
	width: number;
	rating: string;
	createdAt: string;
	getTagGroups?: () => Promise<{ [key: string]: string[] }>;
};

export type BooruTag = {
	label: string;
	value: string;
	color: string;
	postCount?: number;
};

const getBooruProvider = (site: BooruSite) => {
	switch (site) {
		case "danbooru":
			return Danbooru;
		case "gelbooru":
			return Gelbooru;
		case "rule34":
			return Rule34;
		case "e621":
			return e621;
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
	let data = [];
	try {
		data = await response.json();
	} catch (e) {
		console.error(e);
	}
	if (response.ok) {
		return provider.transformPostData(data);
	}
	// for danbooru
	if (data?.error && data?.message) {
		throw new Error(`${data.error}\n${data.message}`);
	}
	throw new Error(`Error: ${response.status} ${response.statusText}`);
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
	const data = await response.json();
	if (response.ok) {
		return provider.transformTagData(data);
	}
	throw new Error(`Error: ${response.status} ${response.statusText}`);
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
			label: "Danbooru",
			value: "danbooru",
			icon: "https://danbooru.donmai.us/favicon.svg",
		},
		{
			label: "Gelbooru",
			value: "gelbooru",
			icon: "https://gelbooru.com/layout/gelbooru-logo.svg",
		},
		{
			label: "Rule 34",
			value: "rule34",
			icon: "https://rule34.xxx/apple-touch-icon-precomposed.png",
		},
		{
			label: "e621",
			value: "e621",
			icon: "https://e621.net/packs/static/main-logo-109ca95d0f436bd372a1.png",
		},
	];
};
