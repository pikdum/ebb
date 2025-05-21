import type { BooruPost, BooruTag } from "./index";

const isBrowser = typeof window !== "undefined";

const headers = {
	"User-Agent": isBrowser ? undefined : "ebb",
};

type e621Post = {
	id: number;
	file: {
		width: number;
		height: number;
		ext: string;
		size: number;
		md5: string;
		url: string;
	};
	preview: {
		width: number;
		height: number;
		url: string;
	};
	sample: {
		has: boolean;
		width: number;
		height: number;
		url: string;
	};
	tags: {
		general: string[];
		artist: string[];
		copyright: string[];
		character: string[];
		species: string[];
		invalid: string[];
		meta: string[];
		lore: string[];
	};
	rating: string;
	created_at: string;
};

type e621Tag = {
	id: number;
	name: string;
	post_count: number;
	category: number;
};

type e621Rating = "General" | "Sensitive" | "Questionable" | "Explicit";
type e621RatingAlias = "g" | "s" | "q" | "e";

export class e621 {
	static ratings: e621Rating[] = [
		"General",
		"Sensitive",
		"Questionable",
		"Explicit",
	];
	static buildTagRequest = ({
		query,
	}: {
		query: string;
	}): Promise<Response> => {
		if (query.length < 3) return Promise.resolve(new Response("[]"));
		const url = new URL("https://e621.net/tags/autocomplete.json");
		url.searchParams.append("search[name_matches]", query);
		url.searchParams.append("expiry", "7");
		return fetch(url, {
			headers,
		});
	};
	static buildPostRequest = ({
		tags,
		limit,
		page,
		rating,
	}: {
		tags: string;
		limit: number;
		page: number;
		rating?: e621Rating;
	}): Promise<Response> => {
		const url = new URL("https://e621.net/posts.json");
		if (rating) {
			tags += ` rating:${rating}`;
		}
		url.searchParams.append("tags", tags);
		url.searchParams.append("limit", limit.toString());
		url.searchParams.append("page", (page + 1).toString());
		return fetch(url, {
			headers,
		});
	};

	static transformPostData = (data: {
		posts: e621Post[];
	}): {
		posts: BooruPost[];
		hasNextPage: boolean;
	} => {
		const e621RatingMap: Record<e621RatingAlias, e621Rating> = {
			g: "General",
			s: "Sensitive",
			q: "Questionable",
			e: "Explicit",
		};
		const posts = data?.posts?.filter((post) => post?.file?.url) ?? [];
		return {
			posts: posts.map((post) => ({
				id: post.id.toString(),
				// combine all tags from all categories into a single array
				tags: Object.values(post.tags).flat() ?? [],
				fileUrl: post.file.url,
				previewUrl: post.preview.url,
				sampleUrl: post.sample.has ? post.sample.url : null,
				height: post.file.height,
				width: post.file.width,
				rating: e621RatingMap[post.rating as e621RatingAlias].toLowerCase(),
				createdAt: new Date(post.created_at).toISOString(),
				getTagGroups: async () => {
					const tagGroups: { [key: string]: string[] } = {};
					const tagMap: Record<string, string[]> = {
						Tag: post.tags.general,
						Artist: post.tags.artist,
						Copyright: post.tags.copyright,
						Character: post.tags.character,
						Species: post.tags.species,
						Invalid: post.tags.invalid,
						Metadata: post.tags.meta,
						Lore: post.tags.lore,
					};

					for (const key in tagMap) {
						if (tagMap[key]?.length) {
							tagGroups[key] = tagMap[key];
						}
					}

					return tagGroups;
				},
			})),
			hasNextPage: posts.length > 0,
		};
	};

	static transformTagData = (data: e621Tag[]): BooruTag[] => {
		const getCategoryColor = (category: number): string => {
			switch (category) {
				case 0: // tag
					return "blue";
				case 1: // artist
					return "orange";
				case 3: // copyright
					return "purple";
				case 4: // character
					return "green";
				case 5: // metadata
					return "yellow";
				default:
					return "gray";
			}
		};
		return data.map((tag) => ({
			label: tag.name,
			value: tag.name,
			postCount: tag.post_count,
			color: getCategoryColor(tag.category),
		}));
	};
}
