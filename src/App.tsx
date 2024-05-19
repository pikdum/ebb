import { Main, MainContextProvider } from "./Main";

export const App = () => {
	return (
		<MainContextProvider>
			<Main />
		</MainContextProvider>
	);
};
