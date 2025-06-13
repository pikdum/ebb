import classNames from "classnames";
import Downshift from "downshift";

import { useMainContext } from "../lib/hooks/useMainContext";

export const RatingSelect = () => {
	const { ratings, currentRating, setCurrentRating } = useMainContext();

	const ratingsDropdown = [
		...ratings.map((e) => ({ label: e, value: e })),
		{ label: "All Content", value: undefined },
	];

	const currentRatingDisplay = ratingsDropdown.find(
		(e) => e.value === currentRating,
	)?.label[0];

	const ratingClassMap = {
		"bg-green-500 hover:bg-green-600": currentRating === "General",
		"bg-yellow-500 hover:bg-yellow-600": currentRating === "Sensitive",
		"bg-orange-500 hover:bg-orange-600": currentRating === "Questionable",
		"bg-red-500 hover:bg-red-600": currentRating === "Explicit",
		"bg-purple-500 hover:bg-purple-600": currentRating === undefined,
	};

	return (
		<Downshift
			onChange={(selection) => {
				if (!selection) return;
				setCurrentRating(selection.value);
			}}
			itemToString={(item) => item?.value ?? ""}
		>
			{({
				getInputProps,
				getItemProps,
				getMenuProps,
				highlightedIndex,
				getToggleButtonProps,
				isOpen,
			}) => (
				<div className="relative">
					<button
						type="button"
						{...getInputProps()}
						{...getToggleButtonProps()}
						className={classNames(
							"border border-gray-300 text-white text-2xl font-semibold rounded-sm h-10 w-10 focus:outline-hidden whitespace-nowrap",
							ratingClassMap,
						)}
					>
						{currentRatingDisplay}
					</button>
					<ul
						{...getMenuProps()}
						className={classNames(
							"absolute right-0 mt-4 p-1 rounded-sm bg-white shadow-xl overflow-y-auto z-20 border border-gray-200",
							{
								hidden: !isOpen,
							},
						)}
					>
						{isOpen &&
							ratingsDropdown.map((item, index) => (
								<li
									key={item.label}
									{...getItemProps({
										index,
										item,
										className: classNames("p-1 rounded-sm cursor-pointer", {
											"bg-blue-200": highlightedIndex === index,
											"font-semibold": item.value === currentRating,
										}),
									})}
								>
									{item.label}
								</li>
							))}
					</ul>
				</div>
			)}
		</Downshift>
	);
};
