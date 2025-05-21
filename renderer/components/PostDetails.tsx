import classNames from "classnames";
import { decode } from "html-entities";
import { useEffect, useState } from "react";
import { Plus } from "react-feather";

import { useAppContext } from "../App";
import { useMainContext } from "../MainApp";
import type { BooruPost } from "../lib/booru";

const TagButton = ({ tag }: { tag: string }) => {
	tag = decode(tag);
	const { query, tempQuery, setTempQuery } = useMainContext();
	const { addTab } = useAppContext();

	const handleTagClick = (tag: string) => {
		if (!tempQuery.split(" ").includes(tag)) {
			setTempQuery((tempQuery) =>
				[...tempQuery.split(" "), tag].filter((e) => e).join(" "),
			);
			return;
		}
		setTempQuery((tempQuery) =>
			tempQuery
				.split(" ")
				.filter((e) => e && e !== tag)
				.join(" "),
		);
	};

	const openInNewTab = (tag: string) => {
		addTab({ title: tag, initialQuery: tag, setActive: false });
	};

	return (
		<div className="relative inline-block group">
			<button
				type="button"
				onClick={() => handleTagClick(tag)}
				className={classNames(
					"bg-blue-500 hover:bg-blue-700 text-white text-xs font-semibold p-1 px-3 rounded-full",
					{
						"bg-blue-700": query.split(" ").includes(tag),
						"bg-purple-500":
							tempQuery.split(" ").includes(tag) &&
							!query.split(" ").includes(tag),
						"bg-red-500":
							!tempQuery.split(" ").includes(tag) &&
							query.split(" ").includes(tag),
					},
				)}
			>
				{tag}
			</button>
			<button
				type="button"
				onClick={() => openInNewTab(tag)}
				className="absolute -right-2 -top-1.5 z-10 invisible group-hover:visible rounded-full bg-indigo-400 hover:bg-indigo-500 text-white"
			>
				<Plus size={20} />
			</button>
		</div>
	);
};

export const PostDetails = ({ post }: { post: BooruPost }) => {
	const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({});

	useEffect(() => {
		if (post.getTagGroups) {
			post.getTagGroups().then(setTagGroups);
		}
	}, [post]); // Ensure post is in the dependency array

	const tagsToUse = post.getTagGroups ? tagGroups : { Tag: post?.tags };

	const sortedTags = Object.entries(tagsToUse).sort(([groupA], [groupB]) =>
		groupA.localeCompare(groupB),
	);

	const formatDate = (dateString?: string) => {
		if (!dateString) {
			return null;
		}
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="break-words col-span-full text-center flex flex-col items-center gap-4 p-2">
			<div className="flex flex-wrap justify-center gap-4">
				{sortedTags.map(([group, tags]) => (
					<div key={group} className="flex flex-wrap justify-center gap-2">
						<div className="inline text-black text-xs font-semibold p-1 px-3 rounded-sm bg-gray-200">
							{group}
						</div>
						{tags.map((tag: string) => (
							<TagButton key={tag} tag={tag} />
						))}
					</div>
				))}
			</div>
			<div className="flex flex-wrap justify-center gap-4 p-2">
				<div className="flex flex-wrap justify-center gap-2 items-center">
					<div className="inline text-black text-xs font-semibold p-1 px-3 rounded-sm bg-gray-200">
						Rating
					</div>
					<button
						type="button"
						className={classNames(
							"text-white text-xs font-semibold p-1 px-3 rounded-full cursor-default",
							{
								"bg-green-500": post.rating === "general",
								"bg-yellow-500": post.rating === "sensitive",
								"bg-orange-500": post.rating === "questionable",
								"bg-red-500": post.rating === "explicit",
							},
						)}
					>
						{post.rating}
					</button>
				</div>

				<div className="flex flex-wrap justify-center gap-2 items-center">
					<div className="inline text-black text-xs font-semibold p-1 px-3 rounded-sm bg-gray-200">
						Post Date
					</div>
					<div className="bg-gray-700 text-white text-xs font-semibold p-1 px-3 rounded-full">
						{formatDate(post.createdAt)}
					</div>
				</div>
			</div>
		</div>
	);
};
