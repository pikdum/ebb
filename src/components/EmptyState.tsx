import { useMainContext } from "../MainApp";

export const EmptyState = () => {
	const { setTempQuery } = useMainContext();
	return (
		<div className="flex items-center justify-center m-6">
			<div className="text-left">
				<h1 className="text-4xl font-semibold mb-2">Quick Start</h1>
				<ul className="list-disc">
					<li>
						Type a tag into the search bar at the top, such as{" "}
						<button
							type="button"
							className="text-blue-500"
							onClick={() => setTempQuery("landscape")}
						>
							landscape
						</button>
						.
					</li>
					<li>Press the blue search button.</li>
					<li>Click on an image to make it full-sized.</li>
					<li>Click on it again to make it small.</li>
					<li>
						The booru can be changed by selecting a different one. It will be
						automatically switched.
					</li>
				</ul>
			</div>
		</div>
	);
};
