import Markdown from "react-markdown";

// @ts-ignore
import changelogText from "../../CHANGELOG.md?raw";
// @ts-ignore
import iconUrl from "../../build/icon.png";

export const EmptyState = () => {
	return (
		<div className="flex flex-col items-center justify-center p-6 gap-4 h-full select-text">
			<base target="_blank" />
			<h1 className="text-4xl font-semibold text-center">ebb</h1>
			<a className="text-blue-500" href="https://github.com/pikdum/ebb">
				https://github.com/pikdum/ebb
			</a>
			<img
				className="rounded-lg w-80 h-80 object-cover shadow-lg"
				src={iconUrl}
				alt="icon"
			/>
			<hr className="border-gray-300 w-2/3 mt-4" />
			<div className="prose flex flex-col items-center">
				<Markdown>{changelogText}</Markdown>
			</div>
		</div>
	);
};
