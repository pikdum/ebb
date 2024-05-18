export interface IElectronAPI {
	booruSearch: (
		booru: string,
		tags: string[],
		options: { [key: string]: string | number },
	) => Promise<Post[]>;
}

export interface Post {
	_data: any; // The raw data from the booru, using `any` since its structure isn't specified
	fileUrl: string; // The direct link to the image, ready to post
	id: string; // The image ID, as a string
	tags: string[]; // The tags, split into an array
	score: number; // The score as a number
	source?: string; // Source of the image, if supplied (optional)
	rating: "s" | "q" | "e"; // Rating of the image, assuming 's', 'q', 'e' for safe, questionable, explicit
	createdAt: Date; // The Date this image was created at
	postView: string; // A URL to the post
}

declare global {
	interface Window {
		electronAPI: IElectronAPI;
	}
}
