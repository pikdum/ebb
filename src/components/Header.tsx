import classNames from "classnames";
import { ChevronLeft, ChevronRight, Search } from "react-feather";

import { useMainContext } from "../MainApp";
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
	} = useMainContext();

	const handleChangeSite = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentSite(e.target.value);
		setPage(0);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setQuery(tempQuery);
		setPage(0);
	};

	const handleIncrementPage = () => {
		setPage((page) => page + 1);
	};

	const handleDecrementPage = () => {
		setPage((page) => page - 1);
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
					<input
						className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:outline-none"
						placeholder="Search..."
						type="search"
						onChange={(e) => setTempQuery(e.currentTarget.value)}
						value={tempQuery}
					/>
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
				<div className="flex gap-2 items-center">
					<button
						type="button"
						className="hover:bg-gray-200 font-bold py-2 rounded disabled:opacity-20 disabled:cursor-not-allowed"
						onClick={handleDecrementPage}
						disabled={page === 0}
					>
						<ChevronLeft />
					</button>
					<span className="text-lg font-bold">{page + 1}</span>
					<button
						type="button"
						className="hover:bg-gray-200 font-bold py-2 rounded disabled:opacity-20 disabled:cursor-not-allowed"
						onClick={handleIncrementPage}
						disabled={query === undefined}
					>
						<ChevronRight />
					</button>
				</div>
			</form>
		</header>
	);
};
