export const App = () => {
	const testFunction = async () => {
		console.info(await window.electronAPI.testFunction());
	};
	const echoFunction = async () => {
		console.info(await window.electronAPI.echoFunction("Hello from React"));
	};
	testFunction();
	echoFunction();
	return <h1>App</h1>;
};
