import classNames from "classnames";
import { decode } from "html-entities";

import { useMainContext } from "../MainApp";
import type { BooruPost } from "../lib/booru";

export const PostDetails = ({ post }: { post: BooruPost }) => {
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
		<div className="px-2 break-words col-span-full text-center">
			{post.tags
				?.map((e) => decode(e))
				?.map((tag) => (
					<button
						type="button"
						key={tag}
						onClick={() => handleTagClick(tag)}
						className={classNames(
							"bg-blue-500 hover:bg-blue-700 text-white text-xs font-semibold p-1 px-3 m-1 rounded-full",
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
				))}
			<button
				type="button"
				className={classNames(
					"text-white text-xs font-semibold p-1 px-3 m-1 rounded-full cursor-default",
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
	);
};
