import classNames from "classnames";
import { Search } from "react-feather";

import { useMainContext } from "../MainApp";
import { Pagination } from "./Pagination";
import { RatingSelect } from "./RatingSelect";
import { SearchInput } from "./SearchInput";
import { SiteSelect } from "./SiteSelect";

export const Header = () => {
	const {
		tempQuery,
		setQuery,
		setPage,
		loading,
		headerRef,
		setAutocompleteResults,
	} = useMainContext();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setQuery(tempQuery);
		setPage(0);
		setAutocompleteResults([]);
	};

	const SubmitButton = () => {
		return (
			<button
				type="submit"
				className={classNames(
					"bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-2 rounded",
					{
						"animate-pulse": loading,
					},
				)}
			>
				<Search />
			</button>
		);
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
					<SearchInput />
					<SubmitButton />
				</div>
				<div className="flex gap-2 items-center justify-between w-full md:w-auto">
					<Pagination />
					<div className="flex gap-2 items-center justify-end">
						<SiteSelect />
						<RatingSelect />
					</div>
				</div>
			</form>
		</header>
	);
};
