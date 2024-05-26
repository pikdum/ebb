import classNames from "classnames";
import Downshift from "downshift";

import { useMainContext } from "../MainApp";

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
		"bg-green-500": currentRating === "General",
		"bg-yellow-500": currentRating === "Sensitive",
		"bg-orange-500": currentRating === "Questionable",
		"bg-red-500": currentRating === "Explicit",
		"bg-gray-500": currentRating === undefined,
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
							"border border-gray-300 text-white text-2xl font-semibold rounded h-10 w-10 focus:outline-none whitespace-nowrap",
							ratingClassMap,
						)}
					>
						{currentRatingDisplay}
					</button>
					<ul
						{...getMenuProps()}
						className={classNames(
							"absolute right-0 mt-4 p-1 rounded bg-white shadow-xl overflow-y-auto z-20 border border-gray-200",
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
										className: classNames("p-1 rounded", {
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
