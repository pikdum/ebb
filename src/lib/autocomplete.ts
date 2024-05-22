type AutocompleteItem = {
	label: string;
	value: string;
};

type Site = "danbooru.donmai.us" | "gelbooru.com" | "safebooru.org";

type SiteConfig = {
	autocomplete: (query: string) => Promise<AutocompleteItem[]>;
};

const sites: Record<Site, SiteConfig> = {
	"danbooru.donmai.us": {
		autocomplete: async (query: string): Promise<AutocompleteItem[]> => {
			type Item = {
				type: string;
				label: string;
				value: string;
				category: number;
				post_count: number;
			};
			if (!query) {
				return [];
			}
			const url = new URL("https://danbooru.donmai.us/autocomplete.json");
			url.searchParams.append("search[query]", query);
			url.searchParams.append("search[type]", "tag_query");
			url.searchParams.append("limit", "10");
			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				return data.map((item: Item) => ({
					label: `${item.label} (${item.post_count})`,
					value: item.value,
				}));
			}
			return [];
		},
	},
	"gelbooru.com": {
		autocomplete: async (query: string): Promise<AutocompleteItem[]> => {
			type Item = {
				type: string;
				label: string;
				value: string;
				category: number;
				post_count: number;
			};
			if (!query) {
				return [];
			}
			const url = new URL("https://gelbooru.com/index.php");
			url.searchParams.append("page", "autocomplete2");
			url.searchParams.append("term", query);
			url.searchParams.append("type", "tag_query");
			url.searchParams.append("limit", "10");
			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				console.log(data);
				return data.map((item: Item) => ({
					label: `${item.label} (${item.post_count})`,
					value: item.value,
				}));
			}
			return [];
		},
	},
	"safebooru.org": {
		autocomplete: async (query: string): Promise<AutocompleteItem[]> => {
			type Item = {
				label: string;
				value: string;
			};
			if (!query) {
				return [];
			}
			const url = new URL("https://safebooru.org/autocomplete.php");
			url.searchParams.append("q", query);
			const response = await fetch(url);
			if (response.ok) {
				const data = (await response.json()) as Item[];
				return data;
			}
			return [];
		},
	},
};

export const autocomplete = async (
	site: string,
	query: string,
): Promise<AutocompleteItem[]> => {
	const handler = sites?.[site as Site]?.autocomplete;
	if (handler) {
		return await handler(query);
	}
	return [];
};
