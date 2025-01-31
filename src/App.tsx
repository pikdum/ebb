import classNames from "classnames";
import { useEffect, useState } from "react";
import { Plus, X } from "react-feather";

import { Main, MainContextProvider, useMainContext } from "./MainApp";

const Tab = ({
	id,
	activeTab,
	setActiveTab,
	closeTab,
	title,
	index,
	disableClose,
}: {
	id: string;
	activeTab: number;
	setActiveTab: (index: number) => void;
	closeTab: (id: string) => void;
	title: string;
	index: number;
	disableClose: boolean;
}) => {
	const showClose = activeTab === index && !disableClose;
	return (
		<div
			className={classNames(
				"p-2 text-sm gap-1 flex items-center bg-gray-300 text-black rounded-md h-8",
				{
					"bg-indigo-500 text-white": activeTab === index,
				},
			)}
		>
			<button type="button" onClick={() => setActiveTab(index)}>
				{title}
			</button>
			<button
				type="button"
				className={classNames(
					"text-white rounded-full hover:bg-indigo-600 p-1",
					{
						hidden: !showClose,
					},
				)}
				onClick={() => closeTab(id)}
				disabled={disableClose}
			>
				<X size={16} />
			</button>
		</div>
	);
};

export const App = () => {
	const [tabs, setTabs] = useState([{ id: crypto.randomUUID(), title: "" }]); // State to manage tabs
	const [activeTab, setActiveTab] = useState(0); // Which tab is active

	const addTab = () => {
		const newTabs = [...tabs, { id: crypto.randomUUID(), title: "" }];
		setTabs(newTabs);
		setActiveTab(newTabs.length - 1);
	};

	const closeCurrentTab = () => {
		if (tabs.length > 1) {
			const idToRemove = tabs[activeTab].id;
			closeTab(idToRemove);
		}
	};

	const closeTab = (id: string) => {
		if (tabs.length > 1) {
			// prevent closing the last tab
			const indexToRemove = tabs.findIndex((tab) => tab.id === id);
			const newTabs = tabs.filter((tab) => tab.id !== id);
			setTabs(newTabs);
			if (activeTab >= indexToRemove) {
				setActiveTab((prev) => (prev === 0 ? 0 : prev - 1));
			}
		}
	};

	const updateTabTitle = (index: number, newTitle: string) => {
		setTabs((prevTabs) => {
			const updatedTabs = [...prevTabs];
			updatedTabs[index].title = newTitle || "New Tab";
			return updatedTabs;
		});
	};

	const switchTabLeft = () => {
		setActiveTab((prevActiveTab) =>
			prevActiveTab === 0 ? tabs.length - 1 : prevActiveTab - 1,
		);
	};

	const switchTabRight = () => {
		setActiveTab((prevActiveTab) =>
			prevActiveTab === tabs.length - 1 ? 0 : prevActiveTab + 1,
		);
	};

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === "t") {
				event.preventDefault();
				addTab();
			} else if (event.ctrlKey && event.key === "w") {
				event.preventDefault();
				closeCurrentTab();
			} else if (
				(event.ctrlKey && event.key === "h") ||
				(event.ctrlKey && event.key === "ArrowLeft")
			) {
				event.preventDefault();
				switchTabLeft();
			} else if (
				(event.ctrlKey && event.key === "l") ||
				(event.ctrlKey && event.key === "ArrowRight")
			) {
				event.preventDefault();
				switchTabRight();
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [activeTab, tabs]);

	return (
		<div>
			<div className="sticky top-0 z-10 flex flex-wrap p-2 bg-gray-100 gap-2 items-center">
				{tabs.map((tab, index) => (
					<Tab
						key={tab.id}
						id={tab.id}
						index={index}
						activeTab={activeTab}
						setActiveTab={setActiveTab}
						closeTab={closeTab}
						title={tab.title}
						disableClose={tabs.length === 1}
					/>
				))}
				<button
					type="button"
					onClick={addTab}
					className="p-2 rounded-full hover:bg-indigo-300 focus:outline-none h-full"
				>
					<Plus size={16} />
				</button>
			</div>
			<div>
				{tabs.map((tab, index) => (
					<div key={tab.id} className={activeTab === index ? "" : "hidden"}>
						<MainContextProvider>
							<MainUpdater index={index} updateTabTitle={updateTabTitle} />
						</MainContextProvider>
					</div>
				))}
			</div>
		</div>
	);
};

// update the tab title based on query state
const MainUpdater = ({
	index,
	updateTabTitle,
}: {
	index: number;
	updateTabTitle: (index: number, newTitle: string) => void;
}) => {
	const { query } = useMainContext();

	useEffect(() => {
		updateTabTitle(index, query);
	}, [query, index, updateTabTitle]);

	return <Main />;
};
