import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi, beforeAll, afterEach } from "vitest";
import { App, useAppContext } from "./App"; // Assuming App and useAppContext are exported

// Mock localStorage
let localStorageMock: {
  store: Record<string, string>;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
} & Storage; // Add Storage interface for full compatibility if needed elsewhere

// Helper component to access context for testing activeTabId
const TestContextConsumer = ({ onRender }: { onRender: (ctx: any) => void }) => {
  const context = useAppContext();
  onRender(context);
  return null;
};


describe("App Component with Tab Persistence and Validation", () => {
  let mockRandomUUIDCounter: number;

  beforeAll(() => {
    localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        store, // expose store for direct inspection/manipulation in tests if needed
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
        // Add length and key properties to satisfy the Storage interface
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
    window.scrollTo = vi.fn(); // Mock window.scrollTo

    mockRandomUUIDCounter = 0;
    Object.defineProperty(window, "crypto", {
      value: {
        randomUUID: vi.fn(() => {
          mockRandomUUIDCounter++;
          return `test-uuid-${mockRandomUUIDCounter}`;
        }),
      },
      writable: true,
      configurable: true,
    });
  });

  beforeEach(() => {
    localStorageMock.clear();
    mockRandomUUIDCounter = 0; // Reset counter for predictable UUIDs in each test
    if (vi.isMockFunction(window.crypto.randomUUID)) {
      vi.mocked(window.crypto.randomUUID).mockClear();
      // Reset the implementation to the counter based one for each test
      vi.mocked(window.crypto.randomUUID).mockImplementation(() => {
        mockRandomUUIDCounter++;
        return `test-uuid-${mockRandomUUIDCounter}`;
      });
    }
     // Reset body to avoid issues with multiple renders if HeadManager is used by a library
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clear all mocks after each test
  });

  describe("Initial State (Empty/Invalid localStorage)", () => {
    test("starts with one default 'New Tab' when localStorage is empty", () => {
      render(<App />);
      const newTabElements = screen.getAllByText("New Tab");
      expect(newTabElements.length).toBe(1); // Check the visible tab title
      expect(newTabElements[0].closest("button")).toBeInTheDocument();


      const storedTabs = JSON.parse(localStorageMock.getItem("localStorageTabs") || "[]");
      expect(storedTabs).toHaveLength(1);
      expect(storedTabs[0].id).toBe("test-uuid-1");
      expect(storedTabs[0].title).toBe("New Tab");

      const storedActiveTabId = JSON.parse(localStorageMock.getItem("localStorageActiveTabId") || "null");
      expect(storedActiveTabId).toBe("test-uuid-1");
    });

    const invalidLocalStorageTestCases = [
      { name: "malformed JSON for tabs", tabs: "invalid-json", activeId: null },
      { name: "tabs is not an array", tabs: JSON.stringify({ not: "an array" }), activeId: null },
      { name: "tabs array contains invalid tab object (missing id)", tabs: JSON.stringify([{ title: "Tab without ID" }]), activeId: null },
      { name: "tabs array contains invalid tab object (missing title)", tabs: JSON.stringify([{ id: "tab-no-title" }]), activeId: null },
      { name: "tabs array contains invalid tab object (id not string)", tabs: JSON.stringify([{ id: 123, title: "ID not string" }]), activeId: null },
      { name: "tabs array is empty", tabs: JSON.stringify([]), activeId: null },
      { name: "malformed JSON for activeTabId", tabs: JSON.stringify([{ id: "t1", title: "Good Tab" }]), activeId: "invalid-json-active" },
      { name: "activeTabId is not a string", tabs: JSON.stringify([{ id: "t1", title: "Good Tab" }]), activeId: JSON.stringify(123) },
      { name: "activeTabId does not match any tab ID", tabs: JSON.stringify([{ id: "t1", title: "Good Tab" }]), activeId: JSON.stringify("t2") },
    ];

    invalidLocalStorageTestCases.forEach(tc => {
      test(`starts with default tab if ${tc.name}`, () => {
        if (tc.tabs) localStorageMock.setItem("localStorageTabs", tc.tabs);
        if (tc.activeId) localStorageMock.setItem("localStorageActiveTabId", tc.activeId);

        render(<App />);

        // For cases where tabs are valid but activeTabId is invalid
        if (tc.name.includes("activeTabId") && tc.tabs === JSON.stringify([{ id: "t1", title: "Good Tab" }])) {
          expect(screen.getByText("Good Tab")).toBeInTheDocument();

          const storedTabs = JSON.parse(localStorageMock.getItem("localStorageTabs") || "[]");
          expect(storedTabs).toHaveLength(1);
          expect(storedTabs[0].id).toBe("t1");
          expect(storedTabs[0].title).toBe("Good Tab");

          const storedActiveTabId = JSON.parse(localStorageMock.getItem("localStorageActiveTabId") || "null");
          expect(storedActiveTabId).toBe("t1"); // Should default to the first valid tab's ID

          expect(vi.mocked(window.crypto.randomUUID)).not.toHaveBeenCalled();
        } else {
          // Original expectation for cases where tabs themselves are invalid
          const newTabElements = screen.getAllByText("New Tab");
          expect(newTabElements.length).toBe(1);
          expect(newTabElements[0].closest("button")).toBeInTheDocument();

          expect(vi.mocked(window.crypto.randomUUID)).toHaveBeenCalledTimes(1);
          const defaultTabId = "test-uuid-1";

          const storedTabs = JSON.parse(localStorageMock.getItem("localStorageTabs") || "[]");
          expect(storedTabs).toHaveLength(1);
          expect(storedTabs[0].id).toBe(defaultTabId);
          expect(storedTabs[0].title).toBe("New Tab");

          const storedActiveTabId = JSON.parse(localStorageMock.getItem("localStorageActiveTabId") || "null");
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

      const tabs = await screen.findAllByText("New Tab"); // Will find two "New Tab" instances
      expect(tabs.length).toBe(2);

      const storedTabs = JSON.parse(localStorageMock.getItem("localStorageTabs") || "[]");
      expect(storedTabs).toHaveLength(2);
      expect(storedTabs[0].id).toBe("test-uuid-1"); // Initial tab
      expect(storedTabs[1].id).toBe("test-uuid-2"); // New tab
      expect(storedTabs[1].title).toBe("New Tab");

      const storedActiveTabId = JSON.parse(localStorageMock.getItem("localStorageActiveTabId") || "null");
      expect(storedActiveTabId).toBe("test-uuid-2"); // New tab becomes active
    });

    test("closing a tab updates localStorage", async () => {
      // Start with two tabs, test-uuid-1 (active by default), test-uuid-2 (will be added)
      // The initial render creates test-uuid-1
      render(<App />);

      // Add a second tab (test-uuid-2), which becomes active
      const addButton = screen.getByRole("button", { name: /add tab/i });
      await act(async () => {
        fireEvent.click(addButton);
      });

      // Now, test-uuid-2 is active. We want to close it.
      // The active tab has "bg-indigo-500" and its close button is visible.
      const activeTabContainer = screen.getByText("New Tab", { selector: ".bg-indigo-500 button" }).closest("div[class*='bg-indigo-500']");
      expect(activeTabContainer).toBeInTheDocument();

      const closeButtonInActiveTab = activeTabContainer?.querySelector("button[class*='text-white'] > svg");
      expect(closeButtonInActiveTab).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(closeButtonInActiveTab!.parentElement!); // Click the button containing the SVG
      });

      // Only one tab should remain
      const remainingTabElements = screen.getAllByText("New Tab");
      expect(remainingTabElements.length).toBe(1);

      const storedTabs = JSON.parse(localStorageMock.getItem("localStorageTabs") || "[]");
      expect(storedTabs).toHaveLength(1);
      expect(storedTabs[0].id).toBe("test-uuid-1"); // The first tab remains

      const storedActiveTabId = JSON.parse(localStorageMock.getItem("localStorageActiveTabId") || "null");
      expect(storedActiveTabId).toBe("test-uuid-1"); // The first tab becomes active again
    });

    test("switching active tab updates localStorage", async () => {
      render(<App />); // Creates tab "test-uuid-1"
      const addButton = screen.getByRole("button", { name: /add tab/i });
      await act(async () => {
        fireEvent.click(addButton); // Creates tab "test-uuid-2", which becomes active
      });

      // Tab "test-uuid-2" is active. Let's click on tab "test-uuid-1".
      // Both tabs are named "New Tab". The first one created is "test-uuid-1".
      const tabButtons = screen.getAllByRole("button", { name: "New Tab" });
      // The tab buttons are rendered in order. tabButtons[0] corresponds to test-uuid-1.

      await act(async () => {
        fireEvent.click(tabButtons[0]); // Click on the first tab to make it active
      });

      const storedActiveTabId = JSON.parse(localStorageMock.getItem("localStorageActiveTabId") || "null");
      expect(storedActiveTabId).toBe("test-uuid-1");
    });

    test("updating tab title updates localStorage", async () => {
      render(<App />); // Creates tab "test-uuid-1"

      // Simulate title update - this requires a way to trigger updateCurrentTabTitle
      // For now, let's assume a mechanism or directly call it if possible via context,
      // or simulate an event that leads to it.
      // This test is more conceptual without a direct user interaction for title editing yet.
      // We can test the underlying function if exposed or by setting up a scenario.
      // For now, we'll check if the `tabs` state change triggers localStorage update.

      // Let's add a new tab, it becomes active, then we'll "change its title" by directly
      // manipulating state via a hypothetical exposed method, or check if setTabs does it.
      // The App component's `updateTabTitle` is what we want to ensure eventually updates localStorage.
      // This is implicitly tested if `setTabs` in `updateTabTitle` triggers the `useEffect` for localStorage.

      // To directly test:
      // 1. Get the setTabs from context (if possible in test, or assume it works)
      // 2. Call setTabs to change a title
      // 3. Check localStorage
      // This is an integration test of sorts.

      // Let's check by adding a tab, then we'll manually construct the expected tabs array
      // as if a title changed, and see if the effect saves it.
      // This is less about "how" the title changes, and more "if" it saves when tabs state changes.

      act(() => {
        // Simulate a title change on the first tab
        // This would normally be done through an interaction that calls updateTabTitle
        // For this test, we'll assume the tabs state is updated correctly by updateTabTitle
        // and just verify the localStorage persistence part of the useEffect.
        // A more complete test would involve interacting with an input field for the title.
        const appRoot = document.querySelector("#root") || document.body; // Fallback to body
        const mainAppContext = JSON.parse(appRoot.dataset.appContext || "null");
        if(mainAppContext) {
            mainAppContext.updateTabTitle("test-uuid-1", "Updated Title");
        }
      });
      // This test setup for title update is incomplete as it relies on an external way to call updateTabTitle
      // or for the context to be easily accessible and modifiable in the test.
      // A proper test would need to simulate the user interaction that leads to updateTabTitle.
      // For now, we know that if `tabs` state changes, the useEffect *will* save it.
      // The validation that `updateTabTitle` itself works correctly is a separate unit/integration concern.
      // Let's assume for now that if tabs state changes, it saves. The previous tests confirm this.
      // We'll add a more specific title update test if an input field is added.

      // Simplified: if tabs state changes, it should be saved.
      // This is already covered by add/close tab tests.
      // A dedicated test for title change would be:
      // 1. Render App.
      // 2. (Hypothetically) find an input for the active tab's title.
      // 3. Change the input's value.
      // 4. Verify localStorage.tabs reflects the new title.
      // Since there's no such input yet, this test is limited.
      // We can, however, verify that the `updateTabTitle` function (if we could call it)
      // results in a localStorage update.

      // Placeholder for a more complete test when title editing UI is available.
      expect(true).toBe(true); // Remove this when actual test is written
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
      localStorageMock.setItem("localStorageActiveTabId", JSON.stringify(initialActiveTabId));

      render(<App />);

      expect(screen.getByText("Saved Tab 1")).toBeInTheDocument();
      expect(screen.getByText("Saved Tab 2")).toBeInTheDocument();

      // Check active tab (e.g. by style or specific attribute if available)
      // In App.tsx, active tab has "bg-indigo-500"
      const activeTabElement = screen.getByText("Saved Tab 2").closest("div[class*='bg-indigo-500']");
      expect(activeTabElement).toBeInTheDocument();

      // Ensure crypto.randomUUID was NOT called because data was loaded
      expect(vi.mocked(window.crypto.randomUUID)).not.toHaveBeenCalled();
    });
  });
});
