type AutocompleteItem = {
	label: string;
	value: string;
};

type Site =
	| "danbooru.donmai.us"
	| "e621.net"
	| "e926.net"
	| "gelbooru.com"
	| "rule34.xxx"
	| "safebooru.org";

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
	"e621.net": {
		autocomplete: async (query: string): Promise<AutocompleteItem[]> => {
			type Item = {
				id: number;
				name: string;
				post_count: number;
				category: number;
			};
			if (!query || query.length < 3) {
				return [];
			}
			const url = new URL("https://e621.net/tags/autocomplete.json");
			url.searchParams.append("search[name_matches]", query);
			url.searchParams.append("expiry", "7");
			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				return data.map((item: Item) => ({
					label: `${item.name} (${item.post_count})`,
					value: item.name,
				}));
			}
			return [];
		},
	},
	"e926.net": {
		autocomplete: async (query: string): Promise<AutocompleteItem[]> => {
			type Item = {
				id: number;
				name: string;
				post_count: number;
				category: number;
			};
			if (!query || query.length < 3) {
				return [];
			}
			const url = new URL("https://e926.net/tags/autocomplete.json");
			url.searchParams.append("search[name_matches]", query);
			url.searchParams.append("expiry", "7");
			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				return data.map((item: Item) => ({
					label: `${item.name} (${item.post_count})`,
					value: item.name,
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
	"rule34.xxx": {
		autocomplete: async (query: string): Promise<AutocompleteItem[]> => {
			type Item = {
				label: string;
				value: string;
			};
			if (!query) {
				return [];
			}
			const url = new URL("https://rule34.xxx/autocomplete.php");
			url.searchParams.append("q", query);
			const response = await fetch(url);
			if (response.ok) {
				const data = (await response.json()) as Item[];
				return data;
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
