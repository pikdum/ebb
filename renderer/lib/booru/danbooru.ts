import type { BooruPost, BooruTag } from "./index";

type DanbooruPost = {
	id: number;
	image_width: number;
	image_height: number;
	tag_string: string;
	file_url: string;
	large_file_url: string;
	preview_file_url: string;
	rating: string;
	tag_string_general: string;
	tag_string_character: string;
	tag_string_copyright: string;
	tag_string_artist: string;
	tag_string_meta: string;
	created_at: string;
};

type DanbooruTag = {
	type: string;
	label: string;
	value: string;
	category: number;
	post_count: number;
};

type DanbooruRating = "General" | "Sensitive" | "Questionable" | "Explicit";
type DanbooruRatingAlias = "g" | "s" | "q" | "e";

export class Danbooru {
	static ratings: DanbooruRating[] = [
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
		const url = new URL("https://danbooru.donmai.us/autocomplete.json");
		url.searchParams.append("search[query]", query);
		url.searchParams.append("search[type]", "tag_query");
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
		rating?: DanbooruRating;
	}): Promise<Response> => {
		const url = new URL("https://danbooru.donmai.us/posts.json");
		if (rating) {
			tags += ` rating:${rating}`;
		}
		url.searchParams.append("tags", tags);
		url.searchParams.append("limit", limit.toString());
		url.searchParams.append("page", (page + 1).toString());
		return fetch(url);
	};

	static transformPostData = (
		data: DanbooruPost[],
	): {
		posts: BooruPost[];
		hasNextPage: boolean;
	} => {
		const danbooruRatingMap: Record<DanbooruRatingAlias, DanbooruRating> = {
			g: "General",
			s: "Sensitive",
			q: "Questionable",
			e: "Explicit",
		};
		const posts = data?.filter((post) => post.file_url) ?? [];
		return {
			posts: posts.map((post) => ({
				id: post.id.toString(),
				postView: `https://danbooru.donmai.us/posts/${post.id}`,
				tags: post.tag_string.split(" ") ?? [],
				fileUrl: post.file_url,
				previewUrl: post.preview_file_url,
				sampleUrl: post.large_file_url || null,
				height: post.image_height,
				width: post.image_width,
				rating:
					danbooruRatingMap[post.rating as DanbooruRatingAlias].toLowerCase(),
				createdAt: new Date(post.created_at).toISOString(),
				getTagGroups: async () => {
					const tagGroups: { [key: string]: string[] } = {};
					tagGroups.Tag = post.tag_string_general.split(" ");
					tagGroups.Character = post.tag_string_character.split(" ");
					tagGroups.Copyright = post.tag_string_copyright.split(" ");
					tagGroups.Artist = post.tag_string_artist.split(" ");
					tagGroups.Metadata = post.tag_string_meta.split(" ");
					return tagGroups;
				},
			})),
			hasNextPage: posts.length > 0,
		};
	};

	static transformTagData = (data: DanbooruTag[]): BooruTag[] => {
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
			label: tag.label,
			value: tag.value,
			postCount: tag.post_count,
			color: getCategoryColor(tag.category),
		}));
	};
}
