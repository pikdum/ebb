import { useState } from "react";
import { Main, MainContextProvider } from "./MainApp";

// Single Tab component to represent individual tab
const Tab = ({ index, activeTab, setActiveTab }) => (
	<button
		className={activeTab === index ? "active" : ""}
		onClick={() => setActiveTab(index)}
	>
		Tab {index + 1}
	</button>
);

export const App = () => {
	const [tabs, setTabs] = useState([{}]); // State to manage tabs
	const [activeTab, setActiveTab] = useState(0); // Which tab is active

	const addTab = () => setTabs([...tabs, {}]);

	return (
		<div>
			<div className="tabs">
				{tabs.map((_, index) => (
					<Tab
						key={index}
						index={index}
						activeTab={activeTab}
						setActiveTab={setActiveTab}
					/>
				))}
				<button onClick={addTab}>Add Tab</button>
			</div>
			<div className="tab-content">
				{tabs.map((_, index) => (
					<div key={index} className={activeTab === index ? "" : "hidden"}>
						<MainContextProvider key={index}>
							<Main />
						</MainContextProvider>
					</div>
				))}
			</div>
		</div>
	);
};

// CSS could include something like this:
// .hidden { display: none; }
// .active { font-weight: bold; }
