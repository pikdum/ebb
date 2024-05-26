import type { BooruPost } from "./index";

type GelbooruPost = {
	id: number;
	width: number;
	height: number;
	tags: string;
	file_url: string;
	preview_url: string;
	sample_url: string;
};

// TODO: look at @attributes, to figure out pagination

export class Gelbooru {
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
	}: {
		tags: string;
		limit: number;
		page: number;
	}): Promise<Response> => {
		const url = new URL(
			"https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1",
		);
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
				})) || [],
			hasNextPage: a.count > a.limit + a.offset,
		};
	};
}
