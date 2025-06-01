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
}): Promise<{ posts: BooruPost[]; hasNextPage: () => Promise<boolean> }> => {
	const provider = getBooruProvider(site);
	const request = provider.buildPostRequest({
		tags,
		limit,
		page,
		rating,
	});
	const response = await request;
	// Store the original data for Gelbooru's hasNextPage check
	let originalData: any = null;
	try {
		originalData = await response.json();
	} catch (e) {
		// If json parsing fails for the initial request, it's a hard error.
		console.error("Failed to parse initial post data", e);
		throw new Error(
			`Error: ${response.status} ${response.statusText} - Failed to parse JSON response`,
		);
	}

	if (!response.ok) {
		// Handle errors as before
		if (originalData?.error && originalData?.message) {
			throw new Error(`${originalData.error}\n${originalData.message}`);
		}
		throw new Error(`Error: ${response.status} ${response.statusText}`);
	}

	// The transformPostData function now returns BooruPost[] directly.
	// For Gelbooru, originalData is { post: GelbooruPost[]; "@attributes": { ... } }
	// For Danbooru, originalData is DanbooruPost[]
	// For e621, originalData is { posts: e621Post[] }
	// For Rule34, originalData is Rule34Post[]
	const posts = provider.transformPostData(originalData);

	const hasNextPage = async (): Promise<boolean> => {
		if (site === "gelbooru") {
			// Gelbooru-specific logic using originalData["@attributes"]
			const attributes = originalData["@attributes"];
			if (attributes) {
				return attributes.count > attributes.limit + attributes.offset;
			}
			return false; // Should not happen if originalData was fetched correctly
		}
		// Logic for Danbooru, e621, Rule34
		// Fetch page + 1 with limit = 1
		const nextPageRequest = provider.buildPostRequest({
			tags,
			limit: 1, // Fetch only one post to check existence
			page: page + 1, // Check the next page
			rating,
		});
		try {
			const nextPageResponse = await nextPageRequest;
			if (!nextPageResponse.ok) {
				// It's okay if the next page doesn't exist or fails to load,
				// treat as no next page.
				console.warn(
					`Failed to fetch next page for hasNextPage check (status: ${nextPageResponse.status})`,
				);
				return false;
			}
			let nextPageData: any = null;
			try {
				nextPageData = await nextPageResponse.json();
			} catch (e) {
				console.warn(
					"Failed to parse next page data for hasNextPage check, assuming no next page.",
					e,
				);
				return false; // If parsing fails, assume no next page
			}

			// provider.transformPostData expects specific structures.
			// For e621, it expects an object like { posts: [...] }.
			// For Danbooru and Rule34, it expects an array [...].
			// The actual structure of nextPageData depends on the provider's API response
			// for an empty result or a result with one post.
			// We pass nextPageData directly, assuming it matches or transformPostData can handle it.
			const nextPosts = provider.transformPostData(nextPageData);
			return nextPosts.length > 0;
		} catch (error) {
			console.error("Error during hasNextPage check:", error);
			return false; // On any error during the check, assume no next page
		}
	};

	return { posts, hasNextPage };
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
