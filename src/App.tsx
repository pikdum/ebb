import { useEffect, useRef, useState } from "react";

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
	const [page, setPage] = useState(0);
	const [tempQuery, setTempQuery] = useState("");
	const [query, setQuery] = useState<string | undefined>();

	const fetchPosts = async () => {
		const tags = query?.split(" ") ?? [];
		const results = await booruSearch("safebooru", tags, {
			page: page,
			limit: 10,
		});
		if (results) {
			setPosts(results);
		}
	};

	useEffect(() => {
		if (query !== undefined) {
			fetchPosts();
		}
	}, [page, query]);

	useEffect(() => {
		if (posts.length > 0) {
			topRef.current.scrollIntoView({ behavior: "smooth" });
		}
	});

	console.info(JSON.stringify(posts));

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

			<main ref={topRef} className="grid grid-cols-2 gap-2">
				{posts.map((post) => (
					<img
						key={post.id}
						className="object-cover w-full aspect-square"
						src={post.fileUrl}
						loading="lazy"
						alt={`${post.id}`}
						title={post.tags.join(" ")}
					/>
				))}
			</main>
		</div>
	);
};
