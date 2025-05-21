import { decode } from "html-entities";

import type { BooruPost, BooruTag } from "./index";

type GelbooruPost = {
	id: number;
	width: number;
	height: number;
	tags: string;
	file_url: string;
	preview_url: string;
	sample_url: string;
	rating: string;
	created_at: string;
};

type GelbooruTag = {
	label: string;
	value: string;
	type: string;
	category: string;
	post_count: string;
};

type GelbooruRating = "General" | "Sensitive" | "Questionable" | "Explicit";

export class Gelbooru {
	static ratings: GelbooruRating[] = [
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
		const url = new URL("https://gelbooru.com/index.php");
		url.searchParams.append("page", "autocomplete2");
		url.searchParams.append("term", query);
		url.searchParams.append("type", "tag_query");
		url.searchParams.append("limit", "10");
		return fetch(url);
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
		rating?: GelbooruRating;
	}): Promise<Response> => {
		const url = new URL(
			"https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1",
		);
		if (rating) {
			tags += ` rating:${rating}`;
		}
		url.searchParams.append("tags", tags);
		url.searchParams.append("pid", page.toString());
		url.searchParams.append("limit", limit.toString());
		return fetch(url);
	};

	static transformPostData = (data: {
		post: GelbooruPost[];
		"@attributes": { limit: number; offset: number; count: number };
	}): { posts: BooruPost[]; hasNextPage: boolean } => {
		const a = data["@attributes"];
		const getTagGroup = (type: number): string => {
			switch (type) {
				case 0:
					return "Tag";
				case 1:
					return "Artist";
				case 3:
					return "Copyright";
				case 4:
					return "Character";
				case 5:
					return "Metadata";
				default:
					return "Unknown";
			}
		};
		return {
			posts:
				data?.post?.map((p: GelbooruPost) => ({
					id: p.id.toString(),
					tags: p.tags.split(" ") ?? [],
					fileUrl: p.file_url,
					previewUrl: p.preview_url,
					sampleUrl: p.sample_url || null,
					height: p.height,
					width: p.width,
					rating: p.rating,
			createdAt: new Date(p.created_at).toISOString(),
					getTagGroups: async () => {
						// TODO: does any single item have more than 100 tags?
						const url = new URL(
							"https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&orderby=name&order=asc",
						);
						url.searchParams.append("names", p.tags);
						const response = await fetch(url);
						const tagData = (await response.json()) as {
							"@attributes": any;
							tag: {
								id: number;
								name: string;
								count: number;
								type: number;
								ambiguous: number;
							}[];
						};
						const tagGroups = tagData?.tag?.reduce<{
							[key: string]: string[];
						}>((acc, tag) => {
							const group = getTagGroup(tag.type);
							acc[group] = acc[group] || [];
							// these are double encoded for some reason
							// so decode it here once, to be consistent
							// TODO: should all providers decode entirely upfront?
							acc[group].push(decode(tag.name));
							return acc;
						}, {});
						return tagGroups;
					},
				})) || [],
			hasNextPage: a.count > a.limit + a.offset,
		};
	};

	static transformTagData = (data: GelbooruTag[]): BooruTag[] => {
		const getCategoryColor = (category: string): string => {
			switch (category) {
				case "tag":
					return "blue";
				case "artist":
					return "orange";
				case "copyright":
					return "purple";
				case "character":
					return "green";
				case "metadata":
					return "yellow";
				default:
					return "gray";
			}
		};

		return data.map((t) => ({
			label: t.label,
			value: t.value,
			postCount: Number.parseInt(t.post_count),
			color: getCategoryColor(t.category),
		}));
	};
}
