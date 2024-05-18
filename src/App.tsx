import classNames from "classnames";
import { useEffect, useState } from "react";
import sites from "./sites.json";

import type { Post } from "./interface";

const booruSearch = async (
	booru: string,
	tags: string[],
	options: { [key: string]: string | number },
): Promise<Post[]> => {
	const data = await window.electronAPI.booruSearch(booru, tags, options);
	return data;
};

// https://tw-elements.com/docs/standard/components/spinners/
const LoadingIndicator = ({ ...args }) => {
	return (
		<div {...args}>
			<div
				className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
				role="status"
			>
				<span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
					Loading...
				</span>
			</div>
		</div>
	);
};

export const App = () => {
	const [posts, setPosts] = useState<Post[]>([]);
	const [page, setPage] = useState(0);
	const [tempQuery, setTempQuery] = useState("");
	const [query, setQuery] = useState<string | undefined>();
	const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
	const [selectedPost, setSelectedPost] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const [currentSite, setCurrentSite] = useState<string>("safebooru.org");

	const fetchPosts = async ({ attempts = 0, maxAttempts = 3 } = {}) => {
		setLoading(true);
		const tags = query?.split(" ") ?? [];
		const results = await booruSearch(currentSite, tags, {
			page: page,
			limit: 25,
		});
		if (results.length > 0) {
			setPosts(results);
			setSelectedPosts([]);
			setLoading(false);
			setError(undefined);
		} else {
			if (attempts < maxAttempts) {
				setError(
					`Attempt ${attempts + 1} of ${maxAttempts} failed. Retrying...`,
				);
				setTimeout(() => {
					fetchPosts({ attempts: attempts + 1 });
				}, 1000);
			} else {
				setPosts([]);
				setSelectedPosts([]);
				setLoading(false);
				setError("No results found.");
			}
		}
	};

	useEffect(() => {
		if (query !== undefined) {
			fetchPosts();
		}
	}, [page, query, currentSite]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setQuery(tempQuery);
		setPage(0);
	};

	const handleChangeSite = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentSite(e.target.value);
		setPage(0);
	};

	const handleIncrementPage = () => {
		setPage((page) => page + 1);
	};

	const handleDecrementPage = () => {
		setPage((page) => page - 1);
	};

	const scrollToId = (id: string) => {
		setTimeout(() => {
			document
				.getElementById(id)
				?.scrollIntoView({ behavior: "smooth", block: "center" });
		}, 0);
	};

	const handleSelectPost = (post_id: string) => {
		setSelectedPost((prev) => (prev === post_id ? undefined : post_id));
		setSelectedPosts((prev) =>
			prev.includes(post_id)
				? prev.filter((id) => id !== post_id)
				: [...prev, post_id],
		);
	};

	const Header = () => {
		return (
			<header className="bg-white border-b border-gray-200 p-2 w-full sticky top-0 z-10">
				<form
					onSubmit={handleSubmit}
					className="flex items-center gap-2 w-full flex-col md:flex-row"
				>
					<div className="flex gap-2 items-center w-full">
						<input
							className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:outline-none"
							placeholder="Search..."
							type="search"
							onChange={(e) => setTempQuery(e.currentTarget.value)}
							value={tempQuery}
						/>
						<select
							className="border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none"
							value={currentSite}
							onChange={handleChangeSite}
						>
							{Object.keys(sites).map((key) => {
								return (
									<option key={key} value={key}>
										{`${key}${sites[key].nsfw ? " (NSFW)" : ""}`}
									</option>
								);
							})}
						</select>
						<button
							type="submit"
							className={classNames(
								"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded",
								{
									"animate-pulse": loading,
								},
							)}
						>
							Search
						</button>
					</div>
					<div className="flex gap-2 items-center">
						<button
							type="button"
							className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={handleDecrementPage}
							disabled={page === 0}
						>
							⮜
						</button>
						<span className="text-lg font-bold">{page + 1}</span>
						<button
							type="button"
							className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
							onClick={handleIncrementPage}
						>
							⮞
						</button>
					</div>
				</form>
			</header>
		);
	};

	const Post = ({ post }: { post: Post }) => {
		return (
			<img
				id={post.id}
				className={classNames("cursor-pointer", {
					"max-w-full max-h-screen col-span-2 md:col-span-3 lg:col-span-4":
						selectedPosts.includes(post.id),
					"object-cover w-full aspect-square": !selectedPosts.includes(post.id),
				})}
				src={
					selectedPosts.includes(post.id)
						? post.fileUrl
						: post?.previewUrl ?? post?.sampleUrl ?? post.fileUrl
				}
				loading="lazy"
				alt={`${post.id}`}
				title={`url: ${post.fileUrl}\n\ntags: ${post.tags.join(" ")}`}
				onClick={() => handleSelectPost(post.id)}
				onLoad={() => {
					if (selectedPost === post.id) {
						scrollToId(post.id);
					}
				}}
			/>
		);
	};

	const EmptyState = () => {
		return (
			<div className="flex items-center justify-center m-6">
				<div className="text-left">
					<h1 className="text-4xl font-semibold mb-2">Quick Start</h1>
					<ul className="list-disc">
						<li>
							Type a tag into the search bar at the top, such as{" "}
							<button
								type="button"
								className="text-blue-500"
								onClick={() => setTempQuery("landscape")}
							>
								landscape
							</button>
							.
						</li>
						<li>Press the blue search button.</li>
						<li>Click on an image to make it full-sized.</li>
						<li>Click on it again to make it small.</li>
						<li>
							The booru can be changed by selecting a different one. It will be
							automatically switched.
						</li>
					</ul>
				</div>
			</div>
		);
	};

	return (
		<div className="select-none">
			{Header()}
			{loading && (
				<LoadingIndicator className="text-center m-6 text-blue-500" />
			)}
			{!loading && (
				<main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
					{posts.map((post) => (
						<Post post={post} key={post.id} />
					))}
				</main>
			)}
			{error && <div className="text-center m-6">{error}</div>}
			{query === undefined && <EmptyState />}
		</div>
	);
};
