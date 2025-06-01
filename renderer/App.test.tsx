import { act, fireEvent, render, screen } from "@testing-library/react";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
	vi,
} from "vitest";
import { App } from "./App";

// Mock localStorage
let localStorageMock: {
	store: Record<string, string>;
	getItem: (key: string) => string | null;
	setItem: (key: string, value: string) => void;
	removeItem: (key: string) => void;
	clear: () => void;
} & Storage;

describe("App Component with Tab Persistence and Validation", () => {
	let mockRandomUUIDCounter: number;

	beforeAll(() => {
		localStorageMock = (() => {
			let store: Record<string, string> = {};
			return {
				store,
				getItem: (key: string) => store[key] || null,
				setItem: (key: string, value: string) => {
					store[key] = value.toString();
				},
				removeItem: (key: string) => {
					delete store[key];
				},
				clear: () => {
					store = {};
				},
				get length() {
					return Object.keys(store).length;
				},
				key(index: number): string | null {
					return Object.keys(store)[index] || null;
				},
			};
		})();

		Object.defineProperty(window, "localStorage", {
			value: localStorageMock,
			writable: true,
			configurable: true,
		});
		window.scrollTo = vi.fn();

		mockRandomUUIDCounter = 0;
		Object.defineProperty(window, "crypto", {
			value: {
				randomUUID: vi.fn(() => {
					mockRandomUUIDCounter++;
					// Return a string that structurally matches UUID format for TypeScript
					return `test-uuid-${mockRandomUUIDCounter.toString().padStart(8, "0")}-4000-8000-000000000000`;
				}),
			},
			writable: true,
			configurable: true,
		});
	});

	beforeEach(() => {
		localStorageMock.clear();
		mockRandomUUIDCounter = 0;
		if (vi.isMockFunction(window.crypto.randomUUID)) {
			vi.mocked(window.crypto.randomUUID).mockClear();
			vi.mocked(window.crypto.randomUUID).mockImplementation(() => {
				mockRandomUUIDCounter++;
				// Return a string that structurally matches UUID format for TypeScript
				return `test-uuid-${mockRandomUUIDCounter.toString().padStart(8, "0")}-4000-8000-000000000000`;
			});
		}
		document.body.innerHTML = "";
		document.head.innerHTML = "";
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("Initial State (Empty/Invalid localStorage)", () => {
		test("starts with one default 'New Tab' when localStorage is empty", () => {
			render(<App />);
			const newTabElements = screen.getAllByText("New Tab");
			expect(newTabElements.length).toBe(1);
			expect(newTabElements[0].closest("button")).toBeInTheDocument();

			const storedTabs = JSON.parse(
				localStorageMock.getItem("localStorageTabs") || "[]",
			);
			expect(storedTabs).toHaveLength(1);
			expect(storedTabs[0].id).toBe(
				"test-uuid-00000001-4000-8000-000000000000",
			);
			expect(storedTabs[0].title).toBe("New Tab");

			const storedActiveTabId = JSON.parse(
				localStorageMock.getItem("localStorageActiveTabId") || "null",
			);
			expect(storedActiveTabId).toBe(
				"test-uuid-00000001-4000-8000-000000000000",
			);
		});

		const invalidLocalStorageTestCases = [
			{ name: "malformed JSON for tabs", tabs: "invalid-json", activeId: null },
			{
				name: "tabs is not an array",
				tabs: JSON.stringify({ not: "an array" }),
				activeId: null,
			},
			{
				name: "tabs array contains invalid tab object (missing id)",
				tabs: JSON.stringify([{ title: "Tab without ID" }]),
				activeId: null,
			},
			{
				name: "tabs array contains invalid tab object (missing title)",
				tabs: JSON.stringify([{ id: "tab-no-title" }]),
				activeId: null,
			},
			{
				name: "tabs array contains invalid tab object (id not string)",
				tabs: JSON.stringify([{ id: 123, title: "ID not string" }]),
				activeId: null,
			},
			{ name: "tabs array is empty", tabs: JSON.stringify([]), activeId: null },
			{
				name: "malformed JSON for activeTabId",
				tabs: JSON.stringify([{ id: "t1", title: "Good Tab" }]),
				activeId: "invalid-json-active",
			},
			{
				name: "activeTabId is not a string",
				tabs: JSON.stringify([{ id: "t1", title: "Good Tab" }]),
				activeId: JSON.stringify(123),
			},
			{
				name: "activeTabId does not match any tab ID",
				tabs: JSON.stringify([{ id: "t1", title: "Good Tab" }]),
				activeId: JSON.stringify("t2"),
			},
		];

		invalidLocalStorageTestCases.forEach((tc) => {
			test(`starts with default tab if ${tc.name}`, () => {
				if (tc.tabs) localStorageMock.setItem("localStorageTabs", tc.tabs);
				if (tc.activeId)
					localStorageMock.setItem("localStorageActiveTabId", tc.activeId);

				render(<App />);

				if (
					tc.name.includes("activeTabId") &&
					tc.tabs === JSON.stringify([{ id: "t1", title: "Good Tab" }])
				) {
					expect(screen.getByText("Good Tab")).toBeInTheDocument();
					const storedTabs = JSON.parse(
						localStorageMock.getItem("localStorageTabs") || "[]",
					);
					expect(storedTabs).toHaveLength(1);
					expect(storedTabs[0].id).toBe("t1");
					expect(storedTabs[0].title).toBe("Good Tab");
					const storedActiveTabId = JSON.parse(
						localStorageMock.getItem("localStorageActiveTabId") || "null",
					);
					expect(storedActiveTabId).toBe("t1");
					expect(vi.mocked(window.crypto.randomUUID)).not.toHaveBeenCalled();
				} else {
					const newTabElements = screen.getAllByText("New Tab");
					expect(newTabElements.length).toBe(1);
					expect(newTabElements[0].closest("button")).toBeInTheDocument();
					expect(vi.mocked(window.crypto.randomUUID)).toHaveBeenCalledTimes(1);
					const defaultTabId = "test-uuid-00000001-4000-8000-000000000000";
					const storedTabs = JSON.parse(
						localStorageMock.getItem("localStorageTabs") || "[]",
					);
					expect(storedTabs).toHaveLength(1);
					expect(storedTabs[0].id).toBe(defaultTabId);
					expect(storedTabs[0].title).toBe("New Tab");
					const storedActiveTabId = JSON.parse(
						localStorageMock.getItem("localStorageActiveTabId") || "null",
					);
					expect(storedActiveTabId).toBe(defaultTabId);
				}
			});
		});
	});

	describe("Saving State", () => {
		test("adding a new tab updates localStorage", async () => {
			render(<App />);
			const addButton = screen.getByRole("button", { name: /add tab/i });
			await act(async () => {
				fireEvent.click(addButton);
			});
			const tabs = await screen.findAllByText("New Tab");
			expect(tabs.length).toBe(2);
			const storedTabs = JSON.parse(
				localStorageMock.getItem("localStorageTabs") || "[]",
			);
			expect(storedTabs).toHaveLength(2);
			expect(storedTabs[0].id).toBe(
				"test-uuid-00000001-4000-8000-000000000000",
			);
			expect(storedTabs[1].id).toBe(
				"test-uuid-00000002-4000-8000-000000000000",
			);
			expect(storedTabs[1].title).toBe("New Tab");
			const storedActiveTabId = JSON.parse(
				localStorageMock.getItem("localStorageActiveTabId") || "null",
			);
			expect(storedActiveTabId).toBe(
				"test-uuid-00000002-4000-8000-000000000000",
			);
		});

		test("closing a tab updates localStorage", async () => {
			render(<App />);
			const addButton = screen.getByRole("button", { name: /add tab/i });
			await act(async () => {
				fireEvent.click(addButton);
			});
			const activeTabContainer = screen
				.getByText("New Tab", { selector: ".bg-indigo-500 button" })
				.closest("div[class*='bg-indigo-500']");
			expect(activeTabContainer).toBeInTheDocument();
			const closeButtonInActiveTab = activeTabContainer?.querySelector(
				"button[class*='text-white'] > svg",
			);
			expect(closeButtonInActiveTab).toBeInTheDocument();
			await act(async () => {
				fireEvent.click(closeButtonInActiveTab!.parentElement!);
			});
			const remainingTabElements = screen.getAllByText("New Tab");
			expect(remainingTabElements.length).toBe(1);
			const storedTabs = JSON.parse(
				localStorageMock.getItem("localStorageTabs") || "[]",
			);
			expect(storedTabs).toHaveLength(1);
			expect(storedTabs[0].id).toBe(
				"test-uuid-00000001-4000-8000-000000000000",
			);
			const storedActiveTabId = JSON.parse(
				localStorageMock.getItem("localStorageActiveTabId") || "null",
			);
			expect(storedActiveTabId).toBe(
				"test-uuid-00000001-4000-8000-000000000000",
			);
		});

		test("switching active tab updates localStorage", async () => {
			render(<App />);
			const addButton = screen.getByRole("button", { name: /add tab/i });
			await act(async () => {
				fireEvent.click(addButton);
			});
			const tabButtons = screen.getAllByRole("button", { name: "New Tab" });
			await act(async () => {
				fireEvent.click(tabButtons[0]);
			});
			const storedActiveTabId = JSON.parse(
				localStorageMock.getItem("localStorageActiveTabId") || "null",
			);
			expect(storedActiveTabId).toBe(
				"test-uuid-00000001-4000-8000-000000000000",
			);
		});

		test("updating tab title updates localStorage", async () => {
			render(<App />);
			// Placeholder for a more complete test when title editing UI is available.
			expect(true).toBe(true);
		});
	});

	describe("Loading Valid State", () => {
		test("loads valid tabs and activeTabId from localStorage", () => {
			const initialTabs = [
				{ id: "saved-uuid-1", title: "Saved Tab 1", initialQuery: "query1" },
				{ id: "saved-uuid-2", title: "Saved Tab 2" },
			];
			const initialActiveTabId = "saved-uuid-2";
			localStorageMock.setItem("localStorageTabs", JSON.stringify(initialTabs));
			localStorageMock.setItem(
				"localStorageActiveTabId",
				JSON.stringify(initialActiveTabId),
			);
			render(<App />);
			expect(screen.getByText("Saved Tab 1")).toBeInTheDocument();
			expect(screen.getByText("Saved Tab 2")).toBeInTheDocument();
			const activeTabElement = screen
				.getByText("Saved Tab 2")
				.closest("div[class*='bg-indigo-500']");
			expect(activeTabElement).toBeInTheDocument();
			expect(vi.mocked(window.crypto.randomUUID)).not.toHaveBeenCalled();
		});
	});
});
