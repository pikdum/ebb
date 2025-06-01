import classNames from "classnames";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { Plus, X } from "react-feather";

import { Main, MainContextProvider } from "./MainApp";

// --- Enhanced Tab Type and Validation ---
type Tab = {
	id: string;
	title: string;
	initialQuery?: string; // Optional, as before
};

function isValidTab(tab: any): tab is Tab {
	return (
		tab &&
		typeof tab.id === "string" &&
		tab.id.length > 0 &&
		typeof tab.title === "string" &&
		tab.title.length > 0 &&
		(typeof tab.initialQuery === "string" ||
			typeof tab.initialQuery === "undefined")
	);
}

function isValidTabsArray(tabs: any): tabs is Tab[] {
	return Array.isArray(tabs) && tabs.every(isValidTab) && tabs.length > 0;
}

// Function to get the default initial tab state
function getDefaultTab(): Tab {
	return { id: crypto.randomUUID(), title: "New Tab", initialQuery: undefined };
}
// --- End of Validation ---

type AppContextType = {
	tabs: Tab[];
	activeTabId: string | null;
	setTabs: Dispatch<SetStateAction<Tab[]>>;
	setActiveTabId: Dispatch<SetStateAction<string | null>>;
	addTab: (options?: {
		title?: string;
		setActive?: boolean;
		initialQuery?: string;
	}) => void;
	closeCurrentTab: () => void;
	closeTab: (id: string) => void;
	switchTabLeft: () => void;
	switchTabRight: () => void;
	updateTabTitle: (id: string, newTitle: string) => void;
	updateCurrentTabTitle: (newTitle: string) => void;
	tabCount: number;
};

const AppContext = createContext({} as AppContextType);

export const useAppContext = () => useContext(AppContext);

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
	const [tabs, setTabs] = useState<Tab[]>(() => {
		const savedTabsRaw = localStorage.getItem("localStorageTabs");
		if (savedTabsRaw) {
			try {
				const parsedTabs = JSON.parse(savedTabsRaw);
				if (isValidTabsArray(parsedTabs)) {
					return parsedTabs;
				}
			} catch (error) {
				console.error(
					"Failed to parse or validate tabs from localStorage:",
					error,
				);
				// Fall through to default if parsing or validation fails
			}
		}
		return [getDefaultTab()]; // Default state if nothing valid in localStorage
	});

	const [activeTabId, setActiveTabId] = useState<string | null>(() => {
		// Initialize activeTabId based on the potentially validated/defaulted tabs
		// This ensures activeTabId always corresponds to a tab in the 'tabs' state
		const savedActiveTabIdRaw = localStorage.getItem("localStorageActiveTabId");
		if (savedActiveTabIdRaw) {
			try {
				const parsedActiveTabId = JSON.parse(savedActiveTabIdRaw);
				// Validate against the current 'tabs' state, which has already been determined
				if (
					typeof parsedActiveTabId === "string" &&
					tabs.find((tab) => tab.id === parsedActiveTabId)
				) {
					return parsedActiveTabId;
				}
			} catch (error) {
				console.error("Failed to parse activeTabId from localStorage:", error);
				// Fall through
			}
		}
		// If no valid activeTabId from localStorage, or if tabs were defaulted,
		// set to the first tab's ID from the current tabs state.
		// The 'tabs' state is guaranteed to have at least one tab here.
		return tabs[0].id;
	});

	const tabCount = tabs.length;

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

	// Persist to localStorage whenever tabs or activeTabId changes
	useEffect(() => {
		localStorage.setItem("localStorageTabs", JSON.stringify(tabs));
		if (activeTabId) {
			// Only save if activeTabId is not null
			localStorage.setItem(
				"localStorageActiveTabId",
				JSON.stringify(activeTabId),
			);
		} else {
			// If activeTabId becomes null (e.g. all tabs closed, though current logic prevents this)
			// We might want to remove it or save null. Current logic defaults to first tab.
			localStorage.removeItem("localStorageActiveTabId");
		}
	}, [tabs, activeTabId]);

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
						aria-label="add tab"
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
