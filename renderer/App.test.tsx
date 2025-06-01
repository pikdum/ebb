import { render, screen, act } from "@testing-library/react";
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import { App, useAppContext } from "./App"; // Assuming App exports useAppContext
import { MainContextProvider } from "./MainApp"; // To check props

// Mock MainApp to simplify testing App.tsx in isolation
vi.mock("./MainApp", async (importOriginal) => {
	const original = await importOriginal();
	return {
		...original,
		Main: () => <div data-testid="main-app-mock" />,
		MainContextProvider: ({ children, query }) => (
			<div data-testid="main-context-provider-mock" data-query={query}>
				{children}
			</div>
		),
	};
});

const SAVED_TABS_KEY = "booruPlus_tabs";
const SAVED_ACTIVE_TAB_ID_KEY = "booruPlus_activeTabId";

// Mock crypto.randomUUID
let uuidCounter = 0;
const mockUUID = () => `test-uuid-${uuidCounter++}`;

// Mock localStorage
let localStorageStore = {};

const mockLocalStorage = {
	getItem: vi.fn((key) => localStorageStore[key] || null),
	setItem: vi.fn((key, value) => {
		localStorageStore[key] = value.toString();
	}),
	clear: vi.fn(() => {
		localStorageStore = {};
	}),
	removeItem: vi.fn((key) => {
		delete localStorageStore[key];
	}),
};

describe("App Component with Tab Persistence", () => {
	beforeEach(() => {
		uuidCounter = 0;
		vi.spyOn(crypto, "randomUUID").mockImplementation(mockUUID);
		Object.defineProperty(window, "localStorage", {
			value: mockLocalStorage,
			writable: true,
		});
		localStorageStore = {}; // Clear store before each test
		mockLocalStorage.getItem.mockClear();
		mockLocalStorage.setItem.mockClear();
		mockLocalStorage.clear.mockClear();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		localStorageStore = {};
	});

	it("initializes with a default tab when no data is in localStorage", () => {
		render(<App />);

		expect(screen.getByText("New Tab")).toBeInTheDocument();
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
			SAVED_TABS_KEY,
			JSON.stringify([{ id: "test-uuid-0", title: "New Tab", query: undefined }])
		);
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
			SAVED_ACTIVE_TAB_ID_KEY,
			"test-uuid-0"
		);
	});

	it("loads saved tabs and active tab ID from localStorage", () => {
		const tabs = [
			{ id: "test-uuid-0", title: "Tab 1", query: "query1" },
			{ id: "test-uuid-1", title: "Tab 2", query: "query2" },
		];
		const activeTabId = "test-uuid-1";
		localStorageStore[SAVED_TABS_KEY] = JSON.stringify(tabs);
		localStorageStore[SAVED_ACTIVE_TAB_ID_KEY] = activeTabId;

		render(<App />);

		expect(screen.getByText("Tab 1")).toBeInTheDocument();
		expect(screen.getByText("Tab 2")).toBeInTheDocument();

		// Check that the active tab's MainContextProvider receives the correct query
		// The active tab is Tab 2, its query is query2
		const mainContextProviderMock = screen.getAllByTestId("main-context-provider-mock").find(
			(el) => el.getAttribute("data-query") === "query2"
		);
		expect(mainContextProviderMock).toBeInTheDocument();
		expect(mainContextProviderMock).toHaveAttribute("data-query", "query2");
	});

	it("handles missing activeTabId by selecting the first tab", () => {
		const tabs = [
			{ id: "test-uuid-0", title: "First Tab", query: "first_query" },
			{ id: "test-uuid-1", title: "Second Tab", query: "second_query" },
		];
		localStorageStore[SAVED_TABS_KEY] = JSON.stringify(tabs);
		// No active tab ID saved

		render(<App />);
		expect(screen.getByText("First Tab")).toBeInTheDocument();
		// Check that the first tab is active and its query is passed
		const mainContextProviderMock = screen.getAllByTestId("main-context-provider-mock").find(
			(el) => el.getAttribute("data-query") === "first_query"
		);
		expect(mainContextProviderMock).toBeInTheDocument();
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(SAVED_ACTIVE_TAB_ID_KEY, "test-uuid-0");
	});

	it("handles invalid activeTabId by selecting the first tab", () => {
		const tabs = [
			{ id: "test-uuid-0", title: "Valid Tab 1", query: "q1" },
			{ id: "test-uuid-1", title: "Valid Tab 2", query: "q2" },
		];
		localStorageStore[SAVED_TABS_KEY] = JSON.stringify(tabs);
		localStorageStore[SAVED_ACTIVE_TAB_ID_KEY] = "invalid-uuid";

		render(<App />);
		expect(screen.getByText("Valid Tab 1")).toBeInTheDocument();
		const mainContextProviderMock = screen.getAllByTestId("main-context-provider-mock").find(
			(el) => el.getAttribute("data-query") === "q1"
		);
		expect(mainContextProviderMock).toBeInTheDocument();
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(SAVED_ACTIVE_TAB_ID_KEY, "test-uuid-0");
	});

	// Test Tab Creation
	it("saves to localStorage when a new tab is added", async () => {
		render(<App />); // Initial tab "test-uuid-0"

		// Reset counter for predictable new tab ID
		uuidCounter = 1;

		let appContext;
		const TestComponent = () => {
			appContext = useAppContext();
			return null;
		};
		render(<TestComponent />, { wrapper: App }); // Re-render with App as wrapper to get context

		await act(async () => {
			appContext.addTab({ title: "Added Tab", query: "addedQuery" });
		});

		expect(screen.getByText("Added Tab")).toBeInTheDocument();
		expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
			SAVED_TABS_KEY,
			JSON.stringify([
				{ id: "test-uuid-0", title: "New Tab", query: undefined },
				{ id: "test-uuid-1", title: "Added Tab", query: "addedQuery" },
			])
		);
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(SAVED_ACTIVE_TAB_ID_KEY, "test-uuid-1");
	});

	// Test Tab Closure
	it("saves to localStorage when a tab is closed", async () => {
		const initialTabs = [
			{ id: "test-uuid-0", title: "Tab To Keep", query: "keepQuery" },
			{ id: "test-uuid-1", title: "Tab To Close", query: "closeQuery" },
		];
		localStorageStore[SAVED_TABS_KEY] = JSON.stringify(initialTabs);
		localStorageStore[SAVED_ACTIVE_TAB_ID_KEY] = "test-uuid-1"; // Tab To Close is active

		uuidCounter = 2; // Next UUID if needed

		let appContext;
		const TestComponent = () => {
			appContext = useAppContext();
			return null;
		};
		render(<TestComponent />, { wrapper: App });

		await act(async () => {
			appContext.closeTab("test-uuid-1");
		});

		expect(screen.queryByText("Tab To Close")).not.toBeInTheDocument();
		expect(screen.getByText("Tab To Keep")).toBeInTheDocument();
		expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
			SAVED_TABS_KEY,
			JSON.stringify([{ id: "test-uuid-0", title: "Tab To Keep", query: "keepQuery" }])
		);
		// Active tab should switch to "test-uuid-0"
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(SAVED_ACTIVE_TAB_ID_KEY, "test-uuid-0");
	});

	// Test Closing the Last Tab
	it("creates a new default tab and saves to localStorage when the last tab is closed", async () => {
		const initialTabs = [{ id: "test-uuid-0", title: "Only Tab", query: "onlyQuery" }];
		localStorageStore[SAVED_TABS_KEY] = JSON.stringify(initialTabs);
		localStorageStore[SAVED_ACTIVE_TAB_ID_KEY] = "test-uuid-0";

		uuidCounter = 1; // For the new default tab

		let appContext;
		const TestComponent = () => {
			appContext = useAppContext();
			return null;
		};
		render(<TestComponent />, { wrapper: App });

		await act(async () => {
			appContext.closeTab("test-uuid-0");
		});

		expect(screen.getByText("New Tab")).toBeInTheDocument(); // New default tab
		expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
			SAVED_TABS_KEY,
			JSON.stringify([{ id: "test-uuid-1", title: "New Tab", query: undefined }])
		);
		expect(mockLocalStorage.setItem).toHaveBeenCalledWith(SAVED_ACTIVE_TAB_ID_KEY, "test-uuid-1");
	});

	// Test Tab Title Update
	it("saves to localStorage when a tab title is updated", async () => {
		const initialTabs = [{ id: "test-uuid-0", title: "Old Title", query: "someQuery" }];
		localStorageStore[SAVED_TABS_KEY] = JSON.stringify(initialTabs);
		localStorageStore[SAVED_ACTIVE_TAB_ID_KEY] = "test-uuid-0";
		uuidCounter = 1;

		let appContext;
		const TestComponent = () => {
			appContext = useAppContext();
			return null;
		};
		render(<TestComponent />, { wrapper: App });

		await act(async () => {
			appContext.updateTabTitle("test-uuid-0", "New Title");
		});

		expect(screen.getByText("New Title")).toBeInTheDocument();
		expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
			SAVED_TABS_KEY,
			JSON.stringify([{ id: "test-uuid-0", title: "New Title", query: "someQuery" }])
		);
	});

	// Test Tab Query Update
	it("saves to localStorage when the current tab query is updated", async () => {
		const initialTabs = [{ id: "test-uuid-0", title: "Test Tab", query: "oldQuery" }];
		localStorageStore[SAVED_TABS_KEY] = JSON.stringify(initialTabs);
		localStorageStore[SAVED_ACTIVE_TAB_ID_KEY] = "test-uuid-0";
		uuidCounter = 1;

		let appContext;
		const TestComponent = () => {
			appContext = useAppContext();
			return null;
		};
		render(<TestComponent />, { wrapper: App });

		await act(async () => {
			appContext.updateCurrentTabQuery("newQuery");
		});

		// Verify localStorage was updated
		expect(mockLocalStorage.setItem).toHaveBeenLastCalledWith(
			SAVED_TABS_KEY,
			JSON.stringify([{ id: "test-uuid-0", title: "Test Tab", query: "newQuery" }])
		);

		// Verify the query is passed to MainContextProvider
		// Need to re-render or find a way to get the updated App's view
		// For now, we trust the setItem call reflects the state change.
		// A more robust way would be to check the prop on the mock after re-render if necessary.
		const mainContextProviderMock = screen.getAllByTestId("main-context-provider-mock").find(
			// The active tab is test-uuid-0
			(el) => {
				// We need to find the provider for the active tab.
				// This is a bit tricky as the App re-renders its children.
				// Let's assume the test setup correctly re-renders and provides the updated query.
				// The query data attribute should be updated.
				return el.getAttribute("data-query") === "newQuery";
			}
		);
		// This assertion might be flaky depending on how App re-renders and TestComponent captures context
		// It's better to ensure the state that *leads* to this prop is correct.
		// The localStorage check is the primary goal here for persistence.
		expect(mainContextProviderMock).toBeInTheDocument();
		expect(mainContextProviderMock).toHaveAttribute("data-query", "newQuery");
	});
});
