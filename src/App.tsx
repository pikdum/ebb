import { Main, MainContextProvider } from "./MainApp";

export const App = () => {
	return (
		<MainContextProvider>
			<Main />
		</MainContextProvider>
	);
};
