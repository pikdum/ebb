import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PostDetails } from "./PostDetails";
import type { BooruPost } from "../lib/booru";

// Mock useAppContext
vi.mock("../App", () => ({
	useAppContext: () => ({
		addTab: vi.fn(),
	}),
}));

// Mock useMainContext
vi.mock("../MainApp", () => ({
	useMainContext: () => ({
		query: "",
		tempQuery: "",
		setTempQuery: vi.fn(),
	}),
}));

const mockPost: BooruPost = {
	id: "123",
	tags: ["tag1", "artist:artist1"],
	fileUrl: "https://example.com/image.jpg",
	previewUrl: "https://example.com/preview.jpg",
	sampleUrl: "https://example.com/sample.jpg",
	postView: "https://example.com/post/123",
	height: 1000,
	width: 800,
	rating: "general",
	createdAt: new Date().toISOString(),
	getTagGroups: undefined, // Let's assume no getTagGroups for simplicity in this test
};

describe("PostDetails", () => {
	it("renders post overview link correctly", () => {
		render(<PostDetails post={mockPost} />);

		// Check for the "Post Overview" label
		expect(screen.getByText("Post Overview")).toBeInTheDocument();

		// Find the link by its text "Link"
		const linkElement = screen.getByRole("link", { name: "Link" });
		expect(linkElement).toBeInTheDocument();

		// Verify href attribute
		expect(linkElement).toHaveAttribute("href", mockPost.postView);

		// Verify target attribute
		expect(linkElement).toHaveAttribute("target", "_blank");

		// Verify rel attribute
		expect(linkElement).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("renders tags correctly when getTagGroups is not defined", () => {
		render(<PostDetails post={mockPost} />);
		expect(screen.getByText("tag1")).toBeInTheDocument();
		expect(screen.getByText("artist:artist1")).toBeInTheDocument();
	});

	it("renders rating and date correctly", () => {
		render(<PostDetails post={mockPost} />);
		expect(screen.getByText(mockPost.rating)).toBeInTheDocument();
		const date = new Date(mockPost.createdAt);
		const formattedDate = date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		expect(screen.getByText(formattedDate)).toBeInTheDocument();
	});


	// Test case for when getTagGroups is defined
	const mockPostWithTagGroups: BooruPost = {
		...mockPost,
		id: "456",
		postView: "https://example.com/post/456",
		getTagGroups: async () => ({
			Character: ["char1", "char2"],
			Artist: ["artist_from_group"],
		}),
	};

	it("renders tags correctly when getTagGroups is defined", async () => {
		render(<PostDetails post={mockPostWithTagGroups} />);

		// Wait for getTagGroups to resolve and tags to render
		expect(await screen.findByText("char1")).toBeInTheDocument();
		expect(await screen.findByText("char2")).toBeInTheDocument();
		expect(await screen.findByText("artist_from_group")).toBeInTheDocument();

		// Ensure original tags are not displayed when getTagGroups is present
		expect(screen.queryByText("tag1")).not.toBeInTheDocument();
		expect(screen.queryByText("artist:artist1")).not.toBeInTheDocument();
	});
});
