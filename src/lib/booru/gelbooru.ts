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
				})) || [],
			hasNextPage: a.count > a.limit + a.offset,
		};
	};

	static transformTagData = (data: GelbooruTag[]): BooruTag[] => {
		const getCategoryColor = (category: string): string => {
			switch (category) {
				case "tag":
					return "blue";
				case "character":
					return "green";
				case "artist":
					return "orange";
				case "copyright":
					return "purple";
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
