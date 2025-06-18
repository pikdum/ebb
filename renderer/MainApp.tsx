import { type ReactNode, useEffect, useRef, useState } from "react";
import { ChevronRight } from "react-feather";

import { EmptyState } from "./components/EmptyState";
import { Header } from "./components/Header";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { Post } from "./components/Post";
import {
	type BooruPost,
	type BooruSite,
	type BooruTag,
	getPosts,
	getRatings,
} from "./lib/booru";
import { MainContext, useMainContext } from "./lib/hooks/useMainContext";

export const MainContextProvider = ({
	initialQuery = undefined,
	children,
}: {
	initialQuery?: string;
	children: ReactNode;
}) => {
	const defaultSite: BooruSite = "danbooru";
	const defaultRatings = getRatings(defaultSite);
	const [posts, setPosts] = useState<BooruPost[]>([]);
	const [page, setPage] = useState(0);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [tempQuery, setTempQuery] = useState(initialQuery ?? "");
	const [query, setQuery] = useState<string | undefined>(initialQuery);
	const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
	const [selectedPost, setSelectedPost] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const [currentSite, setCurrentSite] = useState<BooruSite>(defaultSite);
	const [ratings, setRatings] = useState(defaultRatings);
	const [currentRating, setCurrentRating] = useState(defaultRatings[0]);
	const [autocompleteResults, setAutocompleteResults] = useState<BooruTag[]>(
		[],
	);
	const headerRef = useRef<HTMLDivElement>(null);
	const headerHeight = headerRef.current?.offsetHeight ?? 0;

	const handleSelectPost = (post_id: string) => {
		setSelectedPost((prev) => (prev === post_id ? undefined : post_id));
		setSelectedPosts((prev) =>
			prev.includes(post_id)
				? prev.filter((id) => id !== post_id)
				: [...prev, post_id],
		);
	};

	const scrollToId = (id: string) => {
		setTimeout(() => {
			const element = document.getElementById(id);
			if (element) {
				const viewportHeight = window.innerHeight;
				const elementHeight = element.offsetHeight;

				// retry if elementHeight is 0
				if (elementHeight === 0) {
					setTimeout(() => {
						scrollToId(id);
					}, 100);
					return;
				}

				const offsetTop = element.getBoundingClientRect().top;
				const scrollPosition =
					window.pageYOffset || document.documentElement.scrollTop;

				const scrollTo =
					offsetTop +
					scrollPosition -
					(viewportHeight - elementHeight) / 2 -
					headerHeight / 2;

				window.scrollTo({
					top: scrollTo,
					behavior: "smooth",
				});
			}
		}, 100);
	};

	const fetchPosts = async ({ attempts = 0, maxAttempts = 3 } = {}) => {
		setLoading(true);
		try {
			const results = await getPosts({
				site: currentSite,
				tags: query,
				limit: 100,
				page: page,
				rating: currentRating,
			});
			setPosts(results.posts);
			setHasNextPage(results.hasNextPage);
			setSelectedPosts([]);
			setLoading(false);
			if (results.posts.length === 0) {
				setError("No results found.");
			} else {
				setError(undefined);
			}
		} catch (e) {
			if (attempts < maxAttempts) {
				setError(`${e.message}\nRetrying...`);
				setTimeout(() => {
					fetchPosts({ attempts: attempts + 1 });
				}, 1000);
			} else {
				setPosts([]);
				setSelectedPosts([]);
				setHasNextPage(false);
				setLoading(false);
				setError(e.message);
			}
		}
	};

	const incrementPage = () => {
		setPage((page) => page + 1);
	};

	const decrementPage = () => {
		setPage((page) => page - 1);
	};

	return (
		<MainContext.Provider
			value={{
				posts,
				page,
				setPage,
				tempQuery,
				setTempQuery,
				query,
				setQuery,
				selectedPosts,
				selectedPost,
				loading,
				error,
				currentSite,
				setCurrentSite,
				headerRef,
				headerHeight,
				handleSelectPost,
				scrollToId,
				fetchPosts,
				incrementPage,
				decrementPage,
				autocompleteResults,
				setAutocompleteResults,
				hasNextPage,
				setHasNextPage,
				ratings,
				setRatings,
				currentRating,
				setCurrentRating,
			}}
		>
			{children}
		</MainContext.Provider>
	);
};

export const Main = () => {
	const {
		fetchPosts,
		posts,
		page,
		query,
		loading,
		error,
		currentSite,
		incrementPage,
		hasNextPage,
		currentRating,
	} = useMainContext();

	useEffect(() => {
		if (query !== undefined) {
			fetchPosts();
		}
	}, [page, query, currentSite, currentRating]);

	return (
		<div>
			<Header />
			{loading && (
				<LoadingIndicator className="text-center m-6 text-blue-500" />
			)}
			{!loading && (
				<main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
					{posts.map((post) => (
						<Post post={post} key={post.id} />
					))}
					{hasNextPage && (
						<button
							type="button"
							className="text-3xl bg-gray-200 hover:bg-blue-200 w-full aspect-square grid place-items-center"
							onClick={incrementPage}
						>
							<ChevronRight size={128} />
						</button>
					)}
				</main>
			)}
			{error && <div className="text-center m-6 whitespace-pre">{error}</div>}
			{query === undefined && <EmptyState />}
		</div>
	);
};
