import classNames from "classnames";
import React, { useState } from "react"; // Import useState
import {
	Settings as SettingsIcon, // Added SettingsIcon
	Search,
	ChevronLeft,
	ChevronRight,
	RotateCcw,
	Download,
	Copy,
	ExternalLink,
	X,
	Info,
	Grid,
	List,
} from "react-feather";

import { useAppContext } from "../lib/hooks/useAppContext";
import { useMainContext } from "../lib/hooks/useMainContext";
import { Pagination } from "./Pagination";
import { RatingSelect } from "./RatingSelect";
import { SearchInput } from "./SearchInput";
import { SiteSelect } from "./SiteSelect";
import { Settings } from "./Settings"; // Import the new Settings component

export const Header = () => {
	const { addTab } = useAppContext();
	const {
		tempQuery,
		setTempQuery,
		query,
		setQuery,
		selectedPosts,
		selectedPost,
		currentSite,
		setCurrentSite,
		headerRef,
		fetchPosts,
		page,
		setPage,
		hasNextPage,
		ratings,
		currentRating,
		setCurrentRating,
	} = useMainContext();
	const [showSettings, setShowSettings] = useState(false); // New state for settings visibility

	const handleSearch = (q: string) => {
		setQuery(q);
		setPage(0);
	};

	const handleSiteChange = (site: string) => {
		setCurrentSite(site);
		setQuery(undefined);
		setTempQuery("");
	};

	const handleRatingChange = (rating: string) => {
		setCurrentRating(rating);
		setPage(0);
	};

	return (
		<>
			<div
				ref={headerRef}
				className="sticky top-0 z-10 flex items-center justify-between p-2 bg-gray-100 shadow"
			>
				<div className="flex items-center gap-1">
					<SiteSelect currentSite={currentSite} onChange={handleSiteChange} />
					{ratings.length > 0 && (
						<RatingSelect
							currentRating={currentRating}
							ratings={ratings}
							onChange={handleRatingChange}
						/>
					)}
				</div>
				<div className="flex-1 px-2">
					<SearchInput
						value={tempQuery}
						onChange={setTempQuery}
						onSearch={handleSearch}
						currentSite={currentSite}
					/>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						title="Search"
						className={classNames(
							"p-2 rounded-full hover:bg-gray-200",
							query === tempQuery && "text-indigo-500",
						)}
						onClick={() => handleSearch(tempQuery)}
						disabled={tempQuery === ""}
					>
						<Search size={20} />
					</button>
					<button
						type="button"
						title="Refresh"
						className="p-2 rounded-full hover:bg-gray-200"
						onClick={() => fetchPosts()}
					>
						<RotateCcw size={20} />
					</button>
					<Pagination
						currentPage={page}
						onPageChange={setPage}
						hasNextPage={hasNextPage}
					/>
					<button // Settings button
						type="button"
						title="Settings"
						className="p-2 rounded-full hover:bg-gray-200"
						onClick={() => setShowSettings(true)} // Changed to true to show modal
					>
						<SettingsIcon size={20} />
					</button>
				</div>
			</div>
			{showSettings && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center p-4">
					<div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold">Settings</h2>
							<button
								onClick={() => setShowSettings(false)}
								className="p-1 rounded-full hover:bg-gray-200"
							>
								<X size={24} />
							</button>
						</div>
						<Settings />
						{/* It might be better for the Settings component to have its own close/save logic if it's complex,
								or pass setShowSettings down to it. The current Settings component has a save button.
								A general "Close" button for the modal is good though. */}
					</div>
				</div>
			)}
		</>
	);
};
