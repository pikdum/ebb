import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
} from "react";
import type { BooruPost, BooruSite, BooruTag } from "../booru";

const MainContext = createContext(
	{} as {
		posts: BooruPost[];
		page: number;
		setPage: Dispatch<SetStateAction<number>>;
		tempQuery: string;
		setTempQuery: Dispatch<SetStateAction<string>>;
		query: string | undefined;
		setQuery: Dispatch<SetStateAction<string | undefined>>;
		selectedPosts: string[];
		selectedPost: string | undefined;
		loading: boolean;
		error: string | undefined;
		currentSite: BooruSite;
		setCurrentSite: Dispatch<SetStateAction<BooruSite>>;
		headerRef: React.RefObject<HTMLDivElement>;
		headerHeight: number;
		handleSelectPost: (post_id: string) => void;
		scrollToId: (id: string) => void;
		fetchPosts: (options?: {
			attempts?: number;
			maxAttempts?: number;
		}) => Promise<void>;
		incrementPage: () => void;
		decrementPage: () => void;
		autocompleteResults: BooruTag[];
		setAutocompleteResults: Dispatch<SetStateAction<BooruTag[]>>;
		hasNextPage: boolean;
		setHasNextPage: Dispatch<SetStateAction<boolean>>;
		ratings: string[];
		setRatings: Dispatch<SetStateAction<string[]>>;
		currentRating: string;
		setCurrentRating: Dispatch<SetStateAction<string>>;
	},
);

export const useMainContext = () => useContext(MainContext);
export { MainContext };
