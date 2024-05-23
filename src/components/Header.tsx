import classNames from "classnames";
import Downshift from "downshift";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Search } from "react-feather";

import { useMainContext } from "../MainApp";
import { autocomplete } from "../lib/autocomplete";
import sites from "../sites.json";

export const Header = () => {
	const {
		query,
		tempQuery,
		setTempQuery,
		setQuery,
		page,
		setPage,
		loading,
		currentSite,
		setCurrentSite,
		headerRef,
		incrementPage,
		decrementPage,
		headerHeight,
		autocompleteResults,
		setAutocompleteResults,
	} = useMainContext();

	const searchRef = useRef<HTMLInputElement>(null);
	const isCaretInLastWord =
		searchRef.current?.selectionStart >=
		tempQuery.length - tempQuery.split(" ").pop().length;

	const handleChangeSite = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentSite(e.target.value);
		setPage(0);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setQuery(tempQuery);
		setPage(0);
		setAutocompleteResults([]);
	};

	const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setTempQuery(value);
		try {
			const results = await autocomplete(currentSite, value.split(" ").pop());
			setAutocompleteResults(results);
		} catch (_e) {
			// ignore errors, probably aborted fetch
		}
	};

	const handleDownshiftChange = (
		selection: {
			label: string;
			value: string;
		} | null,
	) => {
		if (!selection) return;
		const currentWord = tempQuery.split(" ").pop();
		const combined = tempQuery.slice(0, -currentWord.length) + selection.value;
		setTempQuery(combined);
		setQuery(combined);
		setPage(0);
		setAutocompleteResults([]);
	};

	return (
		<header
			ref={headerRef}
			className="bg-white border-b border-gray-200 p-2 w-full sticky top-0 z-10"
		>
			<form
				onSubmit={handleSubmit}
				className="flex items-center gap-2 w-full flex-col md:flex-row"
			>
				<div className="flex gap-2 items-center w-full">
					<Downshift
						onChange={handleDownshiftChange}
						itemToString={(item) => item?.value ?? ""}
					>
						{({
							getInputProps,
							getItemProps,
							getMenuProps,
							highlightedIndex,
						}) => (
							<div className="w-full relative">
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
								/>
								<ul
									{...getMenuProps()}
									className={classNames(
										"absolute mt-4 p-1 rounded bg-white shadow-xl overflow-y-auto z-20 border border-gray-200",
										{
											hidden:
												autocompleteResults.length === 0 || !isCaretInLastWord,
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
												className: classNames("p-1 rounded", {
													"bg-blue-200": highlightedIndex === index,
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
					<button
						type="submit"
						className={classNames(
							"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded",
							{
								"animate-pulse": loading,
							},
						)}
					>
						<Search />
					</button>
				</div>
				<div className="flex gap-2 items-center justify-between w-full md:w-auto">
					<div className="flex gap-2 items-center">
						<button
							type="button"
							className="hover:bg-gray-200 font-bold py-2 rounded disabled:opacity-20 disabled:cursor-not-allowed"
							onClick={decrementPage}
							disabled={page === 0}
						>
							<ChevronLeft />
						</button>
						<span className="text-lg font-bold whitespace-nowrap">
							Page {page + 1}
						</span>
						<button
							type="button"
							className="hover:bg-gray-200 font-bold py-2 rounded disabled:opacity-20 disabled:cursor-not-allowed"
							onClick={incrementPage}
							disabled={query === undefined}
						>
							<ChevronRight />
						</button>
					</div>
					<select
						className="border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none"
						value={currentSite}
						onChange={handleChangeSite}
					>
						{Object.keys(sites)
							.sort()
							.map((key) => {
								// @ts-ignore
								const isNSFW = sites?.[key].nsfw;
								return (
									<option key={key} value={key}>
										{`${key}${isNSFW ? " (NSFW)" : ""}`}
									</option>
								);
							})}
					</select>
				</div>
			</form>
		</header>
	);
};
