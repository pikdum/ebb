import { decode } from "html-entities";

import type { BooruPost, BooruTag } from "./index";

type Rule34Post = {
	id: number;
	width: number;
	height: number;
	tags: string;
	file_url: string;
	preview_url: string;
	sample_url: string;
	rating: string;
	change: number;
};

type Rule34Tag = {
	label: string;
	value: string;
	type: string;
};

type Rule34Rating = "General" | "Sensitive" | "Questionable" | "Explicit";

export class Rule34 {
	static ratings: Rule34Rating[] = [
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
		const url = new URL("https://ac.rule34.xxx/autocomplete.php");
		url.searchParams.append("q", query);
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
		rating?: Rule34Rating;
	}): Promise<Response> => {
		const url = new URL(
			"https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1",
		);
		if (rating) {
			tags += ` rating:${rating}`;
		}
		url.searchParams.append("tags", tags);
		url.searchParams.append("pid", page.toString());
		url.searchParams.append("limit", limit.toString());
		return fetch(url);
	};

	static transformPostData = (
		data: Rule34Post[],
	): { posts: BooruPost[]; hasNextPage: boolean } => {
		return {
			posts:
				data?.map((p: Rule34Post) => ({
					id: p.id.toString(),
					tags: p.tags.split(" ") ?? [],
					fileUrl: p.file_url,
					previewUrl: p.preview_url,
					// do not use gif samples
					sampleUrl: p?.sample_url?.endsWith(".gif")
						? p.preview_url
						: p.sample_url,
					height: p.height,
					width: p.width,
					rating: p.rating,
					createdAt: p.change ? new Date(p.change * 1000).toISOString() : undefined,
				})) || [],
			hasNextPage: data.length > 0,
		};
	};

	static transformTagData = (data: Rule34Tag[]): BooruTag[] => {
		const getCategoryColor = (category: string): string => {
			switch (category) {
				case "general":
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

		const tagRegex = /(.*) \((\d+)\)/;

		return data.map((t) => ({
			label: decode(t.value),
			value: decode(t.value),
			postCount: Number.parseInt(t.label.match(tagRegex)[2]),
			color: getCategoryColor(t.type),
		}));
	};
}
