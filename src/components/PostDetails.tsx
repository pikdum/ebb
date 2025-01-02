import classNames from "classnames";
import { decode } from "html-entities";
import { useEffect, useState } from "react";

import { useMainContext } from "../MainApp";
import type { BooruPost } from "../lib/booru";

const TagButton = ({ tag }: { tag: string }) => {
	tag = decode(tag);
	const { query, tempQuery, setTempQuery } = useMainContext();

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

	return (
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
	);
};

export const PostDetails = ({ post }: { post: BooruPost }) => {
	const [tagGroups, setTagGroups] = useState<Record<string, string[]>>({});

	useEffect(() => {
		if (post.getTagGroups) {
			post.getTagGroups().then(setTagGroups);
		}
	}, []);

	const tagsToUse = post.getTagGroups ? tagGroups : { Tag: post?.tags };

	const sortedTags = Object.entries(tagsToUse).sort(([groupA], [groupB]) =>
		groupA.localeCompare(groupB),
	);

	return (
		<div className="break-words col-span-full text-center flex flex-wrap justify-center gap-4 p-2">
			{sortedTags.map(([group, tags]) => (
				<div key={group} className="flex flex-wrap justify-center gap-2">
					<div className="inline text-black text-xs font-semibold p-1 px-3 rounded bg-gray-200">
						{group}
					</div>
					{tags.map((tag: string) => (
						<TagButton key={tag} tag={tag} />
					))}
				</div>
			))}
			<div className="flex flex-wrap justify-center gap-2">
				<div className="inline text-black text-xs font-semibold p-1 px-3 rounded bg-gray-200">
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
		</div>
	);
};
