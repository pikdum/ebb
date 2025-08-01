import { ChevronLeft, ChevronRight } from "react-feather";

import { useMainContext } from "../lib/hooks/useMainContext";

export const Pagination = () => {
	const { page, incrementPage, decrementPage, hasNextPage } = useMainContext();

	return (
		<div className="flex gap-2 items-center">
			<button
				type="button"
				className="hover:bg-gray-200 font-bold py-2 rounded-sm disabled:opacity-20 disabled:cursor-not-allowed"
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
				className="hover:bg-gray-200 font-bold py-2 rounded-sm disabled:opacity-20 disabled:cursor-not-allowed"
				onClick={incrementPage}
				disabled={!hasNextPage}
			>
				<ChevronRight />
			</button>
		</div>
	);
};
