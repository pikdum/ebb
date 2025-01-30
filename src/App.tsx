import { useEffect, useState } from "react";
import { Main, MainContextProvider, useMainContext } from "./MainApp";

// Single Tab component to represent individual tab
const Tab = ({
	index,
	activeTab,
	setActiveTab,
	closeTab,
	title,
	disableClose,
}) => (
	<div
		className={`flex items-center p-2 m-1 ${activeTab === index ? "bg-indigo-500 text-white" : "bg-gray-300 text-black"} rounded-md`}
	>
		<button
			className="flex-1 focus:outline-none"
			onClick={() => setActiveTab(index)}
		>
			{title || `Tab ${index + 1}`}
		</button>
		<button
			className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
			onClick={() => closeTab(index)}
			disabled={disableClose}
		>
			×
		</button>
	</div>
);

export const App = () => {
	const [tabs, setTabs] = useState([{ title: "" }]); // State to manage tabs
	const [activeTab, setActiveTab] = useState(0); // Which tab is active

	const addTab = () => setTabs([...tabs, { title: "" }]);

	const closeTab = (index) => {
		if (tabs.length > 1) {
			// Prevent closing the last tab
			const newTabs = tabs.filter((_, i) => i !== index);
			setTabs(newTabs);
			if (activeTab >= index) {
				setActiveTab((prev) => (prev === 0 ? 0 : prev - 1));
			}
		}
	};

	const updateTabTitle = (index, newTitle) => {
		setTabs((prevTabs) => {
			const updatedTabs = [...prevTabs];
			updatedTabs[index].title = newTitle || "New Tab";
			return updatedTabs;
		});
	};

	return (
		<div>
			<div className="flex flex-wrap p-2 bg-gray-100">
				{tabs.map((tab, index) => (
					<Tab
						key={index}
						index={index}
						activeTab={activeTab}
						setActiveTab={setActiveTab}
						closeTab={closeTab}
						title={tab.title}
						disableClose={tabs.length === 1}
					/>
				))}
				<button
					onClick={addTab}
					className="ml-2 p-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none"
				>
					Add Tab
				</button>
			</div>
			<div className="p-4">
				{tabs.map((_, index) => (
					<div key={index} className={activeTab === index ? "" : "hidden"}>
						<MainContextProvider key={index}>
							<MainUpdater index={index} updateTabTitle={updateTabTitle} />
						</MainContextProvider>
					</div>
				))}
			</div>
		</div>
	);
};

// Component to update the tab title based on Main's query state
const MainUpdater = ({ index, updateTabTitle }) => {
	const { query } = useMainContext();

	useEffect(() => {
		updateTabTitle(index, query);
	}, [query, index, updateTabTitle]);

	return <Main />;
};
