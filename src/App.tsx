import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
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

export const App = () => {
	const headerRef = useRef(null);
	const topRef = useRef(null);
	const [posts, setPosts] = useState<Post[]>([]);
	const [selectedPost, setSelectedPost] = useState<string | undefined>();
	const [page, setPage] = useState(0);
	const [tempQuery, setTempQuery] = useState("");
	const [query, setQuery] = useState<string | undefined>();

	const [currentSite, setCurrentSite] = useState<string>("safebooru.org");

	const fetchPosts = async () => {
		const tags = query?.split(" ") ?? [];
		const results = await booruSearch(currentSite, tags, {
			page: page,
			limit: 25,
		});
		if (results) {
			setPosts(results);
		}
	};

	useEffect(() => {
		if (query !== undefined) {
			fetchPosts();
		}
	}, [page, query, currentSite]);

	console.info(posts);

	useEffect(() => {
		if (posts.length > 0) {
			topRef.current.scrollIntoView({ behavior: "smooth" });
		}
	});

	useEffect(() => {
		setPage(0);
	}, [currentSite]);

	useEffect(() => {
		if (selectedPost) {
			const post = document.getElementById(selectedPost);
			post?.scrollIntoView({ behavior: "smooth" });
		}
	}, [selectedPost]);

	return (
		<div ref={topRef}>
			<header
				ref={headerRef}
				className="bg-white border-b border-gray-200 p-2 w-full sticky top-0 z-10"
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						setQuery(tempQuery);
						setPage(0);
					}}
					className="flex items-center gap-2 w-full flex-col md:flex-row"
				>
					<div className="flex gap-2 items-center w-full">
						<input
							className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:outline-none"
							placeholder="Search..."
							type="search"
							onChange={(e) => setTempQuery(e.currentTarget.value)}
						/>
						<select
							className="border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none"
							value={currentSite}
							onChange={(e) => setCurrentSite(e.target.value)}
						>
							{Object.keys(sites).map((key) => {
								return (
									<option key={key} value={key}>
										{key}
									</option>
								);
							})}
						</select>
						<button
							type="submit"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						>
							Query
						</button>
					</div>
					<div className="flex gap-2 items-center">
						<button
							type="button"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
							onClick={() => {
								setPage(page - 1);
							}}
							disabled={page === 0}
						>
							Previous
						</button>
						<span className="text-lg font-bold">{page + 1}</span>
						<button
							type="button"
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
							onClick={() => {
								setPage(page + 1);
							}}
						>
							Next
						</button>
					</div>
				</form>
			</header>

			<main className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
				{posts.map((post) => (
					<img
						id={post.id}
						key={post.id}
						className={classNames("cursor-pointer", {
							"max-w-full max-h-screen col-span-2 md:col-span-3 lg:col-span-4":
								post.id === selectedPost,
							"object-cover w-full aspect-square": post.id !== selectedPost,
						})}
						src={
							post.id === selectedPost
								? post.fileUrl
								: post?.previewUrl ?? post?.sampleUrl ?? post.fileUrl
						}
						loading="lazy"
						alt={`${post.id}`}
						title={`url: ${post.fileUrl}\n\ntags: ${post.tags.join(" ")}`}
						onClick={() => {
							setSelectedPost((prev) =>
								prev === post.id ? undefined : post.id,
							);
						}}
					/>
				))}
			</main>
		</div>
	);
};
