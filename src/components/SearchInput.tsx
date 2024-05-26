import classNames from "classnames";
import Downshift from "downshift";
import numbro from "numbro";
import { useRef } from "react";

import { useMainContext } from "../MainApp";
import { getTags } from "../lib/booru";

type Selection = { label: string; value: string } | null;

export const SearchInput = ({ ...rest }) => {
	const {
		query,
		tempQuery,
		setTempQuery,
		setQuery,
		setPage,
		currentSite,
		headerHeight,
		autocompleteResults,
		setAutocompleteResults,
	} = useMainContext();

	const searchRef = useRef<HTMLInputElement>(null);

	const isCaretInLastWord =
		searchRef.current?.selectionStart >=
		tempQuery.length - tempQuery.split(" ").pop().length;

	const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setTempQuery(value);
		const results = await getTags({
			site: currentSite,
			query: value.split(" ").pop(),
		});
		console.log(results);
		setAutocompleteResults(results);
	};

	const handleDownshiftChange = (selection: Selection) => {
		if (!selection) return;
		const currentWord = tempQuery.split(" ").pop();
		const combined = tempQuery.slice(0, -currentWord.length) + selection.value;
		setTempQuery(combined);
		setQuery(combined);
		setPage(0);
		setAutocompleteResults([]);
	};

	return (
		<Downshift
			onChange={handleDownshiftChange}
			itemToString={(item) => item?.value ?? ""}
		>
			{({ getInputProps, getItemProps, getMenuProps, highlightedIndex }) => (
				<div className="w-full relative" {...rest}>
					<input
						{...getInputProps()}
						onChange={handleSearchChange}
						value={tempQuery}
						className={classNames(
							"border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:outline-none",
							{
								"border-purple-500": query && query !== tempQuery,
							},
						)}
						ref={searchRef}
						spellCheck="false"
						autoComplete="off"
						autoFocus
					/>
					<ul
						{...getMenuProps()}
						className={classNames(
							"absolute mt-4 p-1 rounded bg-white shadow-xl overflow-y-auto z-20 border border-gray-200",
							{
								hidden:
									autocompleteResults.length === 0 ||
									!isCaretInLastWord ||
									tempQuery === query,
							},
						)}
						style={{ maxHeight: `calc(100vh - ${headerHeight}px - 1em)` }}
					>
						{autocompleteResults.map((item, index) => (
							<li
								key={item.value}
								{...getItemProps({
									index,
									item,
									className: classNames(
										"p-1 rounded flex justify-between gap-8",
										{
											"bg-gray-100": highlightedIndex === index,
										},
									),
								})}
							>
								<div
									className={classNames({
										"text-blue-600": item.color === "blue",
										"text-purple-600": item.color === "purple",
										"text-green-600": item.color === "green",
										"text-orange-600": item.color === "orange",
										"text-gray-600": item.color === "gray",
									})}
								>
									{item.label}
								</div>
								<div className="text-gray-500">
									{numbro(item.postCount).format({
										average: true,
										thousandSeparated: true,
										mantissa: 1,
									})}
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</Downshift>
	);
};
