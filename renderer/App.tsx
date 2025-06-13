import classNames from "classnames";
import { useEffect, useState } from "react";
import { Plus, X } from "react-feather";

import { Main, MainContextProvider } from "./MainApp";
import { AppContext, useAppContext } from "./lib/hooks/useAppContext";

const Tab = ({ id, title }: { id: string; title: string }) => {
	const { activeTabId, setActiveTabId, closeTab, tabCount } = useAppContext();

	const isActive = activeTabId === id;
	const showClose = isActive && tabCount > 1;

	return (
		<div
			className={classNames(
				"p-2 text-sm gap-1 flex items-center bg-gray-300 text-black rounded-md h-8 whitespace-nowrap",
				{
					"bg-indigo-500 text-white": isActive,
				},
			)}
		>
			<button type="button" onClick={() => setActiveTabId(id)}>
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
			>
				<X size={16} />
			</button>
		</div>
	);
};

export const App = () => {
	const [tabs, setTabs] = useState([
		{ id: crypto.randomUUID(), title: "New Tab", initialQuery: undefined },
	]);
	const tabCount = tabs.length;
	const [activeTabId, setActiveTabId] = useState(tabs[0].id);

	const addTab = ({
		title = "New Tab",
		setActive = true,
		initialQuery = undefined,
	} = {}) => {
		const newTabs = [...tabs, { id: crypto.randomUUID(), title, initialQuery }];
		setTabs(newTabs);
		if (setActive) {
			setActiveTabId(newTabs[newTabs.length - 1].id);
		}
	};

	const closeCurrentTab = () => {
		if (tabs.length > 1 && activeTabId) {
			closeTab(activeTabId);
		}
	};

	const closeTab = (id: string) => {
		if (tabs.length > 1) {
			const indexToRemove = tabs.findIndex((tab) => tab.id === id);
			const newTabs = tabs.filter((tab) => tab.id !== id);
			setTabs(newTabs);
			if (activeTabId === id) {
				const newIndex = indexToRemove === 0 ? 0 : indexToRemove - 1;
				setActiveTabId(newTabs[newIndex]?.id || newTabs[0].id);
			}
		}
	};

	const updateTabTitle = (id: string, newTitle: string) => {
		setTabs((prevTabs) => {
			const updatedTabs = prevTabs.map((tab) =>
				tab.id === id ? { ...tab, title: newTitle || "New Tab" } : tab,
			);
			return updatedTabs;
		});
	};

	const updateCurrentTabTitle = (newTitle: string) => {
		if (activeTabId) {
			updateTabTitle(activeTabId, newTitle);
		}
	};

	const switchTabLeft = () => {
		if (tabs.length > 1) {
			const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
			const newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
			setActiveTabId(tabs[newIndex].id);
		}
	};

	const switchTabRight = () => {
		if (tabs.length > 1) {
			const currentIndex = tabs.findIndex((tab) => tab.id === activeTabId);
			const newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
			setActiveTabId(tabs[newIndex].id);
		}
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
	}, [activeTabId, tabs]);

	// TODO: keep track of scroll position per tab?
	useEffect(() => {
		window.scrollTo({
			top: 0,
		});
	}, [activeTabId]);

	return (
		<AppContext.Provider
			value={{
				tabs,
				activeTabId,
				setTabs,
				setActiveTabId,
				addTab,
				closeCurrentTab,
				closeTab,
				switchTabLeft,
				switchTabRight,
				updateTabTitle,
				updateCurrentTabTitle,
				tabCount,
			}}
		>
			<div className="select-none">
				<div className="sticky top-0 z-10 flex p-2 bg-gray-100 gap-2 items-center overflow-x-auto">
					{tabs.map((tab) => (
						<Tab key={tab.id} id={tab.id} title={tab.title} />
					))}
					<button
						type="button"
						onClick={() => addTab()}
						className="p-2 rounded-full hover:bg-indigo-300 focus:outline-hidden h-full"
					>
						<Plus size={16} />
					</button>
				</div>
				<div>
					{tabs.map((tab) => (
						<div
							key={tab.id}
							className={activeTabId === tab.id ? "" : "hidden"}
						>
							<MainContextProvider initialQuery={tab.initialQuery}>
								<Main />
							</MainContextProvider>
						</div>
					))}
				</div>
			</div>
		</AppContext.Provider>
	);
};
