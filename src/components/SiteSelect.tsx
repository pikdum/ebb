import classNames from "classnames";
import Downshift from "downshift";

import { useMainContext } from "../MainApp";
import { type BooruSite, getRatings, getSites } from "../lib/booru";

type Selection = { label: string; value: string } | null;

export const SiteSelect = () => {
	const {
		currentSite,
		setCurrentSite,
		setPage,
		setRatings,
		currentRating,
		setCurrentRating,
	} = useMainContext();
	const sites = getSites();
	const currentSiteData = sites.find((e) => e.value === currentSite);

	const handleChangeSite = (selection: Selection) => {
		if (!selection) return;
		const site = selection.value as BooruSite;
		const ratings = getRatings(site);
		setCurrentSite(site);
		setRatings(ratings);
		if (currentRating && !ratings.includes(currentRating)) {
			setCurrentRating(ratings[0]);
		}
		setPage(0);
	};

	return (
		<Downshift
			onChange={handleChangeSite}
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
						className="border border-gray-300 p-1.5 rounded h-10 w-10 focus:outline-none bg-blue-500 hover:bg-blue-600 grid place-items-center"
					>
						<img
							src={currentSiteData?.icon}
							alt={currentSiteData?.label}
							className="object-cover w-full aspect-square"
						/>
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
							sites.map((item, index) => (
								<li
									key={item.value}
									{...getItemProps({
										index,
										item,
										className: classNames("p-1 rounded cursor-pointer", {
											"bg-blue-200": highlightedIndex === index,
											"font-semibold": item.value === currentSite,
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
