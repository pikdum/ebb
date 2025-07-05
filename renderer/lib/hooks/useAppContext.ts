import {
	createContext,
	type Dispatch,
	type SetStateAction,
	useContext,
} from "react";

type Tab = {
	id: string;
	title: string;
	initialQuery?: string;
};

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
export { AppContext };
