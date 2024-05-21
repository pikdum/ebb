type AutocompleteItem = {
	label: string;
	value: string;
};

type Site = "danbooru.donmai.us";

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
